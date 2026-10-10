begin;
create function public.valid_plan_items(items text[]) returns boolean language sql immutable set search_path='' as $$
 select coalesce(cardinality(items) between 1 and 8 and array_ndims(items)=1 and array_position(items,null) is null and (select bool_and(char_length(trim(item)) between 1 and 120) and count(*)=count(distinct lower(trim(item))) from unnest(items) item),false);
$$;
alter table public.journal_annotations add column plan_items text[] not null default array['Entry followed my plan','Risk was defined before entry','Exit followed my plan'];
alter table public.journal_annotations drop constraint journal_annotations_checklist_check;
alter table public.journal_annotations add constraint valid_annotation_plan check(public.valid_plan_items(plan_items) and cardinality(checklist)=cardinality(plan_items) and array_ndims(checklist)=1 and array_position(checklist,null) is null);
grant insert(plan_items),update(plan_items) on public.journal_annotations to authenticated;
create table public.journal_plan_templates (
 user_id uuid primary key references auth.users(id) on delete cascade,
 name text not null check(char_length(trim(name)) between 1 and 80),
 items text[] not null check(public.valid_plan_items(items)),
 revision integer not null default 1 check(revision>0)
);
alter table public.journal_plan_templates enable row level security;
create policy plan_read on public.journal_plan_templates for select to authenticated using((select auth.uid())=user_id);
create policy plan_insert on public.journal_plan_templates for insert to authenticated with check((select auth.uid())=user_id);
create policy plan_update on public.journal_plan_templates for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
revoke all on public.journal_plan_templates from anon,authenticated;
grant select on public.journal_plan_templates to authenticated;
grant insert(user_id,name,items,revision),update(name,items,revision) on public.journal_plan_templates to authenticated;
grant all on public.journal_plan_templates to service_role;
commit;
