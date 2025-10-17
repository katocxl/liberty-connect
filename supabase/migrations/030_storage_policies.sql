-- 030_storage_policies.sql
-- Configure storage buckets and row level policies

insert into storage.buckets (id, name, public)
values
    ('events', 'events', false),
    ('announcements', 'announcements', false),
    ('avatars', 'avatars', false)
on conflict (id) do nothing;

-- Helpers ensure only scoped buckets are affected
drop policy if exists "Members can read managed objects" on storage.objects;
create policy "Members can read managed objects"
on storage.objects
for select
using (
    bucket_id in ('events', 'announcements', 'avatars')
    and public.storage_object_org_id(name) is not null
    and (
        public.is_active_member(public.storage_object_org_id(name))
        or (
            auth.uid() is null
            and coalesce(public.is_guest_allowed(public.storage_object_org_id(name)), false)
        )
    )
);

drop policy if exists "Members can upload managed objects" on storage.objects;
create policy "Members can upload managed objects"
on storage.objects
for insert
with check (
    bucket_id in ('events', 'announcements', 'avatars')
    and public.storage_object_org_id(name) is not null
    and auth.uid() is not null
    and public.is_active_member(public.storage_object_org_id(name))
);

drop policy if exists "Admins can modify managed objects" on storage.objects;
create policy "Admins can modify managed objects"
on storage.objects
for update
using (
    bucket_id in ('events', 'announcements', 'avatars')
    and public.storage_object_org_id(name) is not null
    and public.has_org_role(public.storage_object_org_id(name), array['owner'::public.member_role, 'moderator'::public.member_role])
)
with check (
    bucket_id in ('events', 'announcements', 'avatars')
    and public.storage_object_org_id(name) is not null
    and public.has_org_role(public.storage_object_org_id(name), array['owner'::public.member_role, 'moderator'::public.member_role])
);

drop policy if exists "Admins can delete managed objects" on storage.objects;
create policy "Admins can delete managed objects"
on storage.objects
for delete
using (
    bucket_id in ('events', 'announcements', 'avatars')
    and public.storage_object_org_id(name) is not null
    and public.has_org_role(public.storage_object_org_id(name), array['owner'::public.member_role, 'moderator'::public.member_role])
);
