begin;
create table public.journal_playbooks (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 name text not null check(char_length(trim(name)) between 1 and 80),
 items text[] not null check(public.valid_plan_items(items)),
 revision integer not null default 1 check(revision>0)
);
create table public.journal_risk_inputs (
 user_id uuid not null references auth.users(id) on delete cascade,
 slice_key text not null check(slice_key ~ '^[a-f0-9]{64}$'),
 stop text not null default '' check(stop='' or stop ~ '^(0|[1-9][0-9]{0,11})(\.[0-9]{1,8})?$'),
 target text not null default '' check(target='' or target ~ '^(0|[1-9][0-9]{0,11})(\.[0-9]{1,8})?$'),
 budget text not null default '' check(budget='' or budget ~ '^(0|[1-9][0-9]{0,11})(\.[0-9]{1,8})?$'),
 revision integer not null default 1 check(revision>0),
 primary key(user_id,slice_key)
);
alter table public.journal_playbooks enable row level security;
alter table public.journal_risk_inputs enable row level security;
create policy playbooks_read on public.journal_playbooks for select to authenticated using((select auth.uid())=user_id);
create policy playbooks_insert on public.journal_playbooks for insert to authenticated with check((select auth.uid())=user_id);
create policy playbooks_update on public.journal_playbooks for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy risk_read on public.journal_risk_inputs for select to authenticated using((select auth.uid())=user_id);
create policy risk_insert on public.journal_risk_inputs for insert to authenticated with check((select auth.uid())=user_id);
create policy risk_update on public.journal_risk_inputs for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
revoke all on public.journal_playbooks,public.journal_risk_inputs from anon,authenticated;
grant select on public.journal_playbooks,public.journal_risk_inputs to authenticated;
grant insert(id,user_id,name,items,revision),update(name,items,revision) on public.journal_playbooks to authenticated;
grant insert(user_id,slice_key,stop,target,budget,revision),update(stop,target,budget,revision) on public.journal_risk_inputs to authenticated;
grant all on public.journal_playbooks,public.journal_risk_inputs to service_role;
commit;
