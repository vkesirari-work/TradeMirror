begin;
create table public.journal_annotations (
 user_id uuid not null references auth.users(id) on delete cascade,
 slice_key text not null check(slice_key ~ '^[0-9a-f]{64}$'),
 notes text not null default '' check(char_length(notes)<=10000),
 tags text[] not null default '{}' check(cardinality(tags)<=10),
 checklist boolean[] not null default '{false,false,false}' check(cardinality(checklist)=3 and array_ndims(checklist)=1 and array_position(checklist,null) is null),
 revision integer not null default 1 check(revision>0),
 primary key(user_id,slice_key),
 check(array_to_string(tags,'') is not null)
);
create function public.valid_journal_tags(values_to_check text[]) returns boolean language sql immutable set search_path='' as $$
 select coalesce(bool_and(value is not null and char_length(trim(value)) between 1 and 40),true) from unnest(values_to_check) as value;
$$;
alter table public.journal_annotations add constraint valid_tags check(public.valid_journal_tags(tags));
alter table public.journal_annotations enable row level security;
create policy journal_read on public.journal_annotations for select to authenticated using((select auth.uid())=user_id);
create policy journal_insert on public.journal_annotations for insert to authenticated with check((select auth.uid())=user_id);
create policy journal_update on public.journal_annotations for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
revoke all on public.journal_annotations from anon,authenticated;
grant select on public.journal_annotations to authenticated;
grant insert(user_id,slice_key,notes,tags,checklist,revision) on public.journal_annotations to authenticated;
grant update(notes,tags,checklist,revision) on public.journal_annotations to authenticated;
grant all on public.journal_annotations to service_role;
commit;
