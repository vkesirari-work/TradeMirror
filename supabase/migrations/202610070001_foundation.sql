begin;
create type public.broker as enum ('ZERODHA','DHAN','UPSTOX','ANGEL_ONE','GROWW');
create type public.report_status as enum ('PROVISIONAL','FINAL');
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default 'Trader' check (char_length(display_name) between 1 and 100),
 timezone text not null default 'Asia/Kolkata', currency text not null default 'INR',
 created_at timestamptz not null default now()
);
create table public.broker_connections (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 broker public.broker not null, status text not null default 'DISCONNECTED' check(status in ('CONNECTED','DISCONNECTED','EXPIRED')),
 last_synced_at timestamptz, created_at timestamptz not null default now(), unique(id,user_id), unique(user_id,broker)
);
-- Never store broker tokens in browser-readable tables. Future credentials need a separate secure store.
create table public.broker_imports (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 broker public.broker not null, connection_id uuid, source text not null check(source in ('CSV','API')),
 file_name text, fingerprint text not null, status text not null default 'PENDING' check(status in ('PENDING','PROCESSING','COMPLETED','FAILED')),
 row_count integer not null default 0 check(row_count>=0), error_summary text,
 created_at timestamptz not null default now(), unique(id,user_id), unique(user_id,broker,fingerprint),
 foreign key(connection_id,user_id) references public.broker_connections(id,user_id)
);
create table public.raw_broker_records (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 import_id uuid not null, record_key text not null, payload jsonb not null,
 created_at timestamptz not null default now(), unique(id,user_id), unique(import_id,record_key),
 foreign key(import_id,user_id) references public.broker_imports(id,user_id) on delete cascade
);
create table public.orders (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 broker public.broker not null, broker_order_id text not null, execution_id text not null,
 raw_data_id uuid, instrument text not null, side text not null check(side in ('BUY','SELL')),
 quantity numeric(18,4) not null check(quantity>0), price numeric(18,4) not null check(price>=0),
 executed_at timestamptz not null, created_at timestamptz not null default now(), unique(id,user_id),
 unique(user_id,broker,execution_id), foreign key(raw_data_id,user_id) references public.raw_broker_records(id,user_id)
);
create table public.trades (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 broker public.broker not null, raw_data_id uuid, instrument text not null, strike numeric(18,4),
 option_type text check(option_type in ('CE','PE')), side text not null check(side in ('LONG','SHORT')),
 entry_price numeric(18,4) not null check(entry_price>=0), exit_price numeric(18,4) check(exit_price>=0),
 quantity numeric(18,4) not null check(quantity>0), entry_time timestamptz not null, exit_time timestamptz,
 gross_pnl numeric(18,4), charges numeric(18,4) check(charges>=0), net_pnl numeric(18,4),
 report_status public.report_status not null default 'PROVISIONAL', finalized_at timestamptz,
 notes text check(char_length(notes)<=10000), created_at timestamptz not null default now(), unique(id,user_id),
 check(exit_time is null or exit_time>=entry_time),
 check(net_pnl is null or (gross_pnl is not null and charges is not null and net_pnl=gross_pnl-charges)),
 check(report_status <> 'FINAL' or (finalized_at is not null and charges is not null)),
 foreign key(raw_data_id,user_id) references public.raw_broker_records(id,user_id)
);
create table public.trade_metrics (
 trade_id uuid primary key, user_id uuid not null references public.profiles(id) on delete cascade,
 mfe numeric(18,4), mae numeric(18,4), planned_stop_loss numeric(18,4), planned_target numeric(18,4),
 early_exit boolean, stop_loss_violation boolean,
 foreign key(trade_id,user_id) references public.trades(id,user_id) on delete cascade
);
create table public.daily_metrics (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 trading_date date not null, gross_pnl numeric(18,4) not null, charges numeric(18,4) not null check(charges>=0),
 net_pnl numeric(18,4) not null, total_trades integer not null check(total_trades>=0),
 win_rate numeric(6,3) check(win_rate between 0 and 100), status public.report_status not null default 'PROVISIONAL', finalized_at timestamptz,
 unique(user_id,trading_date), check(net_pnl=gross_pnl-charges), check(status<>'FINAL' or finalized_at is not null)
);
create table public.ai_reports (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 period_start date not null, period_end date not null, report_kind text not null check(report_kind in ('DAILY','WEEKLY')),
 status public.report_status not null default 'PROVISIONAL', finalized_at timestamptz,
 metrics_snapshot jsonb not null, content jsonb not null, created_at timestamptz not null default now(),
 check(period_end>=period_start), check(status<>'FINAL' or finalized_at is not null)
);
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 insert into public.profiles(id,display_name) values(new.id,coalesce(nullif(left(trim(new.raw_user_meta_data->>'display_name'),100),''),'Trader'));
 return new;
end;
$$;
revoke all on function public.handle_new_user() from public;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
-- Support accounts created before this migration.
insert into public.profiles(id,display_name) select id,coalesce(nullif(left(trim(raw_user_meta_data->>'display_name'),100),''),'Trader') from auth.users on conflict(id) do nothing;

-- Explicit grants: users can read their own derived records, but cannot fabricate broker data or finalized reports.
revoke all on public.profiles,public.broker_connections,public.broker_imports,public.raw_broker_records,public.orders,public.trades,public.trade_metrics,public.daily_metrics,public.ai_reports from anon,authenticated;
grant select on public.profiles,public.broker_connections,public.broker_imports,public.raw_broker_records,public.orders,public.trades,public.trade_metrics,public.daily_metrics,public.ai_reports to authenticated;
grant update(display_name) on public.profiles to authenticated;
grant update(notes) on public.trades to authenticated;
grant update(planned_stop_loss,planned_target) on public.trade_metrics to authenticated;
grant usage on type public.broker,public.report_status to authenticated,service_role;
grant all on public.profiles,public.broker_connections,public.broker_imports,public.raw_broker_records,public.orders,public.trades,public.trade_metrics,public.daily_metrics,public.ai_reports to service_role;
alter table public.profiles enable row level security;
create policy profiles_read on public.profiles for select to authenticated using ((select auth.uid())=id);
create policy profiles_update on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
do $$
declare t text;
begin
 foreach t in array array['broker_connections','broker_imports','raw_broker_records','orders','trades','trade_metrics','daily_metrics','ai_reports'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('create policy own_records_read on public.%I for select to authenticated using ((select auth.uid())=user_id)',t);
  execute format('create index on public.%I(user_id)',t);
 end loop;
end;
$$;
create policy trades_notes_update on public.trades for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy trade_plan_update on public.trade_metrics for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create index trades_user_entry on public.trades(user_id,entry_time desc);
create index orders_user_execution on public.orders(user_id,executed_at);
commit;
