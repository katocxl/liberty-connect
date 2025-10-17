-- 000_init.sql
-- Base schema for LibertyConnect

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";
create extension if not exists "pg_cron";
create extension if not exists "pg_net";
create extension if not exists "supabase_vault";

create type public.member_role as enum ('owner', 'moderator', 'member');
create type public.member_status as enum ('active', 'invited', 'suspended');
create type public.rsvp_status as enum ('yes', 'no', 'maybe');
create type public.report_status as enum ('open', 'in_review', 'resolved', 'dismissed');
create type public.report_target_type as enum ('prayer', 'announcement', 'devotional', 'event', 'user');
create type public.device_platform as enum ('ios', 'android', 'web');

create table public.organizations (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    timezone text not null default 'UTC',
    allow_guest_access boolean not null default true,
    default_locale text not null default 'en',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.organization_members (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations (id) on delete cascade,
    user_id uuid not null references auth.users (id) on delete cascade,
    role public.member_role not null default 'member',
    status public.member_status not null default 'active',
    invited_by uuid references auth.users (id) on delete set null,
    invited_at timestamptz,
    joined_at timestamptz default now(),
    last_seen_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (org_id, user_id)
);

create index organization_members_user_idx on public.organization_members (user_id);
create index organization_members_org_idx on public.organization_members (org_id);

create table public.announcements (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations (id) on delete cascade,
    author_id uuid not null references auth.users (id) on delete cascade,
    title text not null,
    body text not null,
    hero_image_path text,
    pinned boolean not null default false,
    published_at timestamptz not null default now(),
    expires_at timestamptz,
    hidden_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index announcements_org_published_idx on public.announcements (org_id, published_at desc);

create table public.devotionals (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations (id) on delete cascade,
    author_id uuid not null references auth.users (id) on delete cascade,
    title text not null,
    scripture_reference text,
    body text not null,
    published_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index devotionals_org_published_idx on public.devotionals (org_id, published_at desc);

create table public.prayers (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations (id) on delete cascade,
    author_id uuid references auth.users (id) on delete set null,
    body text not null,
    is_anonymous boolean not null default false,
    hidden_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index prayers_org_created_idx on public.prayers (org_id, created_at desc);
create index prayers_author_idx on public.prayers (author_id);

create table public.prayer_reactions (
    prayer_id uuid not null references public.prayers (id) on delete cascade,
    user_id uuid not null references auth.users (id) on delete cascade,
    emoji text not null,
    created_at timestamptz not null default now(),
    primary key (prayer_id, user_id, emoji)
);

create index prayer_reactions_user_idx on public.prayer_reactions (user_id);

create table public.events (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations (id) on delete cascade,
    created_by uuid not null references auth.users (id) on delete cascade,
    title text not null,
    description text,
    location text,
    location_url text,
    start_at timestamptz not null,
    end_at timestamptz,
    all_day boolean not null default false,
    cover_image_path text,
    capacity integer,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index events_org_start_idx on public.events (org_id, start_at);

create table public.rsvps (
    event_id uuid not null references public.events (id) on delete cascade,
    user_id uuid not null references auth.users (id) on delete cascade,
    status public.rsvp_status not null default 'yes',
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (event_id, user_id)
);

create table public.checkins (
    id uuid primary key default gen_random_uuid(),
    event_id uuid not null references public.events (id) on delete cascade,
    user_id uuid not null references auth.users (id) on delete cascade,
    checked_in_at timestamptz not null default now()
);

create index checkins_event_user_idx on public.checkins (event_id, user_id);

create table public.reports (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations (id) on delete cascade,
    reporter_id uuid not null references auth.users (id) on delete cascade,
    target_type public.report_target_type not null,
    target_id uuid not null,
    reason text not null,
    details jsonb,
    status public.report_status not null default 'open',
    created_at timestamptz not null default now(),
    resolved_at timestamptz,
    resolved_by uuid references auth.users (id) on delete set null,
    resolution_note text,
    hidden_at timestamptz
);

create index reports_org_status_idx on public.reports (org_id, status);
create index reports_target_idx on public.reports (target_type, target_id);

create table public.blocks (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations (id) on delete cascade,
    blocker_id uuid not null references auth.users (id) on delete cascade,
    blocked_user_id uuid not null references auth.users (id) on delete cascade,
    reason text,
    created_at timestamptz not null default now(),
    unique (org_id, blocker_id, blocked_user_id)
);

create table public.device_tokens (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations (id) on delete cascade,
    user_id uuid not null references auth.users (id) on delete cascade,
    token text not null,
    platform public.device_platform not null,
    last_seen_at timestamptz not null default now(),
    disabled_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (token)
);

create index device_tokens_user_idx on public.device_tokens (user_id);
create index device_tokens_org_idx on public.device_tokens (org_id);

create table public.notification_preferences (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations (id) on delete cascade,
    user_id uuid not null references auth.users (id) on delete cascade,
    events boolean not null default true,
    announcements boolean not null default true,
    devotionals boolean not null default true,
    prayer_replies boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (org_id, user_id)
);

create table public.admin_actions (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations (id) on delete cascade,
    actor_id uuid not null references auth.users (id) on delete cascade,
    action text not null,
    target_type text not null,
    target_id uuid,
    payload jsonb,
    created_at timestamptz not null default now()
);

create index admin_actions_org_idx on public.admin_actions (org_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create or replace function public.is_active_member(target_org uuid)
returns boolean
language sql
stable
as $$
    select exists (
        select 1
        from public.organization_members m
        where m.org_id = target_org
          and m.user_id = auth.uid()
          and m.status = 'active'
    );
$$;

create or replace function public.has_org_role(target_org uuid, roles public.member_role[])
returns boolean
language sql
stable
as $$
    select exists (
        select 1
        from public.organization_members m
        where m.org_id = target_org
          and m.user_id = auth.uid()
          and m.status = 'active'
          and m.role = any (roles)
    );
$$;

create or replace function public.is_guest_allowed(target_org uuid)
returns boolean
language sql
stable
as $$
    select o.allow_guest_access
    from public.organizations o
    where o.id = target_org;
$$;

create or replace function public.safe_cast_uuid(value text)
returns uuid
language plpgsql
immutable
as $$
declare
    result uuid;
begin
    begin
        result := value::uuid;
    exception
        when others then
            return null;
    end;
    return result;
end;
$$;

create or replace function public.storage_object_org_id(object_name text)
returns uuid
language sql
immutable
as $$
    select public.safe_cast_uuid(split_part(object_name, '/', 1));
$$;

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create trigger organization_members_set_updated_at
before update on public.organization_members
for each row execute function public.set_updated_at();

create trigger announcements_set_updated_at
before update on public.announcements
for each row execute function public.set_updated_at();

create trigger devotionals_set_updated_at
before update on public.devotionals
for each row execute function public.set_updated_at();

create trigger prayers_set_updated_at
before update on public.prayers
for each row execute function public.set_updated_at();

create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create trigger rsvps_set_updated_at
before update on public.rsvps
for each row execute function public.set_updated_at();

create trigger device_tokens_set_updated_at
before update on public.device_tokens
for each row execute function public.set_updated_at();

create trigger notification_preferences_set_updated_at
before update on public.notification_preferences
for each row execute function public.set_updated_at();
