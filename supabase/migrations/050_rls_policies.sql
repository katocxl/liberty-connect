-- 050_rls_policies.sql
-- Row level security policies for multi-tenant safety

alter table public.organizations enable row level security;
alter table public.organizations force row level security;

drop policy if exists "Guests can view public orgs" on public.organizations;
create policy "Guests can view public orgs"
on public.organizations
for select
using (allow_guest_access);

drop policy if exists "Members can view org" on public.organizations;
create policy "Members can view org"
on public.organizations
for select
using (public.is_active_member(id));

drop policy if exists "Owners manage org" on public.organizations;
create policy "Owners manage org"
on public.organizations
for update
using (public.has_org_role(id, array['owner'::public.member_role]))
with check (public.has_org_role(id, array['owner'::public.member_role]));

drop policy if exists "Owners delete org" on public.organizations;
create policy "Owners delete org"
on public.organizations
for delete
using (public.has_org_role(id, array['owner'::public.member_role]));

alter table public.organization_members enable row level security;
alter table public.organization_members force row level security;

drop policy if exists "Members can read roster" on public.organization_members;
create policy "Members can read roster"
on public.organization_members
for select
using (
    public.is_active_member(org_id)
    or auth.uid() = user_id
);

drop policy if exists "Admins manage roster" on public.organization_members;
create policy "Admins manage roster"
on public.organization_members
for insert
with check (
    auth.uid() is not null
    and public.has_org_role(org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
);

drop policy if exists "Admins update roster" on public.organization_members;
create policy "Admins update roster"
on public.organization_members
for update
using (
    public.has_org_role(org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
)
with check (
    public.has_org_role(org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
);

drop policy if exists "Admins remove roster" on public.organization_members;
create policy "Admins remove roster"
on public.organization_members
for delete
using (
    public.has_org_role(org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
);

alter table public.announcements enable row level security;
alter table public.announcements force row level security;

drop policy if exists "Read announcements within org" on public.announcements;
create policy "Read announcements within org"
on public.announcements
for select
using (
    public.is_active_member(org_id)
    or (
        auth.uid() is null
        and coalesce(public.is_guest_allowed(org_id), false)
    )
);

drop policy if exists "Admins publish announcements" on public.announcements;
create policy "Admins publish announcements"
on public.announcements
for insert
with check (
    public.has_org_role(org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
    and author_id = auth.uid()
);

drop policy if exists "Admins edit announcements" on public.announcements;
create policy "Admins edit announcements"
on public.announcements
for update
using (
    public.has_org_role(org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
)
with check (
    public.has_org_role(org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
);

drop policy if exists "Admins delete announcements" on public.announcements;
create policy "Admins delete announcements"
on public.announcements
for delete
using (
    public.has_org_role(org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
);

alter table public.devotionals enable row level security;
alter table public.devotionals force row level security;

drop policy if exists "Read devotionals within org" on public.devotionals;
create policy "Read devotionals within org"
on public.devotionals
for select
using (
    public.is_active_member(org_id)
    or (
        auth.uid() is null
        and coalesce(public.is_guest_allowed(org_id), false)
    )
);

drop policy if exists "Admins publish devotionals" on public.devotionals;
create policy "Admins publish devotionals"
on public.devotionals
for insert
with check (
    public.has_org_role(org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
    and author_id = auth.uid()
);

drop policy if exists "Admins edit devotionals" on public.devotionals;
create policy "Admins edit devotionals"
on public.devotionals
for update
using (
    public.has_org_role(org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
)
with check (
    public.has_org_role(org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
);

drop policy if exists "Admins delete devotionals" on public.devotionals;
create policy "Admins delete devotionals"
on public.devotionals
for delete
using (
    public.has_org_role(org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
);

alter table public.prayers enable row level security;
alter table public.prayers force row level security;

drop policy if exists "Read prayers within org" on public.prayers;
create policy "Read prayers within org"
on public.prayers
for select
using (
    public.is_active_member(org_id)
    or (
        auth.uid() is null
        and coalesce(public.is_guest_allowed(org_id), false)
    )
);

drop policy if exists "Members create prayers" on public.prayers;
create policy "Members create prayers"
on public.prayers
for insert
with check (
    public.is_active_member(org_id)
    and (
        author_id is null
        or author_id = auth.uid()
    )
);

drop policy if exists "Authors and admins edit prayers" on public.prayers;
create policy "Authors and admins edit prayers"
on public.prayers
for update
using (
    (
        author_id = auth.uid()
        and public.is_active_member(org_id)
    )
    or public.has_org_role(org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
)
with check (
    (
        author_id = auth.uid()
        and public.is_active_member(org_id)
    )
    or public.has_org_role(org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
);

drop policy if exists "Authors and admins delete prayers" on public.prayers;
create policy "Authors and admins delete prayers"
on public.prayers
for delete
using (
    (
        author_id = auth.uid()
        and public.is_active_member(org_id)
    )
    or public.has_org_role(org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
);

alter table public.prayer_reactions enable row level security;
alter table public.prayer_reactions force row level security;

drop policy if exists "Members read prayer reactions" on public.prayer_reactions;
create policy "Members read prayer reactions"
on public.prayer_reactions
for select
using (
    exists (
        select 1
        from public.prayers p
        where p.id = prayer_reactions.prayer_id
          and (
              public.is_active_member(p.org_id)
              or (
                  auth.uid() is null
                  and coalesce(public.is_guest_allowed(p.org_id), false)
              )
          )
    )
);

drop policy if exists "Members upsert prayer reactions" on public.prayer_reactions;
create policy "Members upsert prayer reactions"
on public.prayer_reactions
for insert
with check (
    auth.uid() = user_id
    and exists (
        select 1
        from public.prayers p
        where p.id = prayer_reactions.prayer_id
          and public.is_active_member(p.org_id)
    )
);

drop policy if exists "Members update own prayer reactions" on public.prayer_reactions;
create policy "Members update own prayer reactions"
on public.prayer_reactions
for update
using (
    auth.uid() = user_id
    and exists (
        select 1
        from public.prayers p
        where p.id = prayer_reactions.prayer_id
          and public.is_active_member(p.org_id)
    )
)
with check (
    auth.uid() = user_id
    and exists (
        select 1
        from public.prayers p
        where p.id = prayer_reactions.prayer_id
          and public.is_active_member(p.org_id)
    )
);

drop policy if exists "Members delete own prayer reactions" on public.prayer_reactions;
create policy "Members delete own prayer reactions"
on public.prayer_reactions
for delete
using (
    auth.uid() = user_id
    and exists (
        select 1
        from public.prayers p
        where p.id = prayer_reactions.prayer_id
          and public.is_active_member(p.org_id)
    )
);

alter table public.events enable row level security;
alter table public.events force row level security;

drop policy if exists "Read events within org" on public.events;
create policy "Read events within org"
on public.events
for select
using (
    public.is_active_member(org_id)
    or (
        auth.uid() is null
        and coalesce(public.is_guest_allowed(org_id), false)
    )
);

drop policy if exists "Admins create events" on public.events;
create policy "Admins create events"
on public.events
for insert
with check (
    public.has_org_role(org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
    and created_by = auth.uid()
);

drop policy if exists "Admins update events" on public.events;
create policy "Admins update events"
on public.events
for update
using (
    public.has_org_role(org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
)
with check (
    public.has_org_role(org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
);

drop policy if exists "Admins delete events" on public.events;
create policy "Admins delete events"
on public.events
for delete
using (
    public.has_org_role(org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
);

alter table public.rsvps enable row level security;
alter table public.rsvps force row level security;

drop policy if exists "Members read rsvps" on public.rsvps;
create policy "Members read rsvps"
on public.rsvps
for select
using (
    exists (
        select 1
        from public.events e
        where e.id = rsvps.event_id
          and public.is_active_member(e.org_id)
    )
);

drop policy if exists "Members manage own rsvp" on public.rsvps;
create policy "Members manage own rsvp"
on public.rsvps
for insert
with check (
    auth.uid() = user_id
    and exists (
        select 1
        from public.events e
        where e.id = rsvps.event_id
          and public.is_active_member(e.org_id)
    )
);

drop policy if exists "Members update own rsvp" on public.rsvps;
create policy "Members update own rsvp"
on public.rsvps
for update
using (
    auth.uid() = user_id
    and exists (
        select 1
        from public.events e
        where e.id = rsvps.event_id
          and public.is_active_member(e.org_id)
    )
)
with check (
    auth.uid() = user_id
    and exists (
        select 1
        from public.events e
        where e.id = rsvps.event_id
          and public.is_active_member(e.org_id)
    )
);

drop policy if exists "Members delete own rsvp" on public.rsvps;
create policy "Members delete own rsvp"
on public.rsvps
for delete
using (
    auth.uid() = user_id
    and exists (
        select 1
        from public.events e
        where e.id = rsvps.event_id
          and public.is_active_member(e.org_id)
    )
);

alter table public.checkins enable row level security;
alter table public.checkins force row level security;

drop policy if exists "Members read checkins" on public.checkins;
create policy "Members read checkins"
on public.checkins
for select
using (
    exists (
        select 1
        from public.events e
        where e.id = checkins.event_id
          and public.is_active_member(e.org_id)
    )
);

drop policy if exists "Admins record checkins" on public.checkins;
create policy "Admins record checkins"
on public.checkins
for insert
with check (
    exists (
        select 1
        from public.events e
        where e.id = checkins.event_id
          and public.has_org_role(e.org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
    )
);

drop policy if exists "Admins delete checkins" on public.checkins;
create policy "Admins delete checkins"
on public.checkins
for delete
using (
    exists (
        select 1
        from public.events e
        where e.id = checkins.event_id
          and public.has_org_role(e.org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
    )
);

alter table public.reports enable row level security;
alter table public.reports force row level security;

drop policy if exists "Reporters view own reports" on public.reports;
create policy "Reporters view own reports"
on public.reports
for select
using (
    reporter_id = auth.uid()
    or public.has_org_role(org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
);

drop policy if exists "Members create reports" on public.reports;
create policy "Members create reports"
on public.reports
for insert
with check (
    auth.uid() = reporter_id
    and public.is_active_member(org_id)
);

drop policy if exists "Admins resolve reports" on public.reports;
create policy "Admins resolve reports"
on public.reports
for update
using (
    public.has_org_role(org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
)
with check (
    public.has_org_role(org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
);

alter table public.blocks enable row level security;
alter table public.blocks force row level security;

drop policy if exists "Members view blocks" on public.blocks;
create policy "Members view blocks"
on public.blocks
for select
using (
    public.is_active_member(org_id)
    and auth.uid() is not null
);

drop policy if exists "Members manage own blocks" on public.blocks;
create policy "Members manage own blocks"
on public.blocks
for insert
with check (
    auth.uid() = blocker_id
    and public.is_active_member(org_id)
);

drop policy if exists "Members remove own blocks" on public.blocks;
create policy "Members remove own blocks"
on public.blocks
for delete
using (
    auth.uid() = blocker_id
    and public.is_active_member(org_id)
);

alter table public.device_tokens enable row level security;
alter table public.device_tokens force row level security;

drop policy if exists "Owners view device tokens" on public.device_tokens;
create policy "Owners view device tokens"
on public.device_tokens
for select
using (
    user_id = auth.uid()
    or public.has_org_role(org_id, array['owner'::public.member_role, 'moderator'::public.member_role])
);

drop policy if exists "Members register token" on public.device_tokens;
create policy "Members register token"
on public.device_tokens
for insert
with check (
    auth.uid() = user_id
    and public.is_active_member(org_id)
);

drop policy if exists "Members update token" on public.device_tokens;
create policy "Members update token"
on public.device_tokens
for update
using (
    auth.uid() = user_id
    and public.is_active_member(org_id)
)
with check (
    auth.uid() = user_id
    and public.is_active_member(org_id)
);

drop policy if exists "Members delete token" on public.device_tokens;
create policy "Members delete token"
on public.device_tokens
for delete
using (
    auth.uid() = user_id
    and public.is_active_member(org_id)
);

alter table public.notification_preferences enable row level security;
alter table public.notification_preferences force row level security;

drop policy if exists "Members view notification prefs" on public.notification_preferences;
create policy "Members view notification prefs"
on public.notification_preferences
for select
using (
    auth.uid() = user_id
    and public.is_active_member(org_id)
);

drop policy if exists "Members upsert notification prefs" on public.notification_preferences;
create policy "Members upsert notification prefs"
on public.notification_preferences
for insert
with check (
    auth.uid() = user_id
    and public.is_active_member(org_id)
);

drop policy if exists "Members update notification prefs" on public.notification_preferences;
create policy "Members update notification prefs"
on public.notification_preferences
for update
using (
    auth.uid() = user_id
    and public.is_active_member(org_id)
)
with check (
    auth.uid() = user_id
    and public.is_active_member(org_id)
);
