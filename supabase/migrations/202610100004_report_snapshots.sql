begin;
create table public.report_snapshots (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 mode text not null check(mode in ('daily','weekly')),
 period date not null,
 fingerprint text not null check(fingerprint ~ '^[0-9a-f]{64}$'),
 payload jsonb not null check(coalesce(jsonb_typeof(payload)='object' and octet_length(payload::text)<=65536 and payload->>'format'='trademirror-report' and payload->>'version'='1',false)),
 unique(user_id,mode,period,fingerprint)
);
alter table public.report_snapshots enable row level security;
create policy snapshots_read on public.report_snapshots for select to authenticated using((select auth.uid())=user_id);
create policy snapshots_insert on public.report_snapshots for insert to authenticated with check((select auth.uid())=user_id);
revoke all on public.report_snapshots from anon,authenticated;
grant select on public.report_snapshots to authenticated;
grant insert(user_id,mode,period,fingerprint,payload) on public.report_snapshots to authenticated;
grant all on public.report_snapshots to service_role;

create table public.ai_review_usage (
 user_id uuid primary key references auth.users(id) on delete cascade,
 request_day date not null,
 attempts integer not null check(attempts between 1 and 5),
 last_requested_at timestamptz not null
);
alter table public.ai_review_usage enable row level security;
revoke all on public.ai_review_usage from public,anon,authenticated;
grant all on public.ai_review_usage to service_role;
create function public.reserve_ai_review() returns boolean language plpgsql security definer set search_path='' as $$
declare owner_id uuid:=auth.uid(); usage_row public.ai_review_usage; today date:=(now() at time zone 'UTC')::date;
begin
 if owner_id is null then raise exception 'Authentication required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(owner_id::text,731));
 select * into usage_row from public.ai_review_usage where user_id=owner_id;
 if found and (usage_row.last_requested_at>now()-interval '90 seconds' or (usage_row.request_day=today and usage_row.attempts>=5)) then return false; end if;
 insert into public.ai_review_usage(user_id,request_day,attempts,last_requested_at) values(owner_id,today,1,now())
 on conflict(user_id) do update set request_day=today,attempts=case when public.ai_review_usage.request_day=today then public.ai_review_usage.attempts+1 else 1 end,last_requested_at=now();
 return true;
end;
$$;
revoke all on function public.reserve_ai_review() from public,anon;
grant execute on function public.reserve_ai_review() to authenticated;

create table public.broker_statements (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 fingerprint text not null check(fingerprint ~ '^[0-9a-f]{64}$'),
 payload jsonb not null check(coalesce(jsonb_typeof(payload)='object' and octet_length(payload::text)<=2097152 and payload->>'broker'='ZERODHA' and payload->>'segment'='F&O',false)),
 unique(user_id,fingerprint)
);
alter table public.broker_statements enable row level security;
create policy statements_read on public.broker_statements for select to authenticated using((select auth.uid())=user_id);
create policy statements_insert on public.broker_statements for insert to authenticated with check((select auth.uid())=user_id);
revoke all on public.broker_statements from public,anon,authenticated;
grant select on public.broker_statements to authenticated;
grant insert(user_id,fingerprint,payload) on public.broker_statements to authenticated;
grant all on public.broker_statements to service_role;
commit;
