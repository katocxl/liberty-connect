\set ON_ERROR_STOP on

begin;

select plan(8);

-- Seed minimal fixture data to exercise RLS paths.
with upsert_users as (
    insert into auth.users (
        id,
        instance_id,
        email,
        raw_user_meta_data,
        raw_app_meta_data,
        aud,
        role,
        email_confirmed_at,
        last_sign_in_at,
        created_at,
        updated_at
    )
    values
        (
            'aaaaaaaa-1111-1111-1111-aaaaaaaaaaa0',
            '00000000-0000-0000-0000-000000000000',
            'owner@example.com',
            jsonb_build_object('full_name', 'Owner User'),
            jsonb_build_object('default_org', 'cccccccc-3333-4444-5555-666666666660'),
            'authenticated',
            'authenticated',
            now(),
            now(),
            now(),
            now()
        ),
        (
            'bbbbbbbb-2222-2222-2222-bbbbbbbbbbb0',
            '00000000-0000-0000-0000-000000000000',
            'member@example.com',
            jsonb_build_object('full_name', 'Member User'),
            jsonb_build_object('default_org', 'cccccccc-3333-4444-5555-666666666660'),
            'authenticated',
            'authenticated',
            now(),
            now(),
            now(),
            now()
        )
    on conflict (id) do nothing
)
select 1;

insert into public.organizations (
    id,
    name,
    slug,
    timezone,
    allow_guest_access,
    default_locale,
    created_at,
    updated_at
)
values (
    'cccccccc-3333-4444-5555-666666666660',
    'Guest Friendly Org',
    'guest-friendly',
    'America/New_York',
    true,
    'en',
    now(),
    now()
);

insert into public.organization_members (
    id,
    org_id,
    user_id,
    role,
    status,
    joined_at,
    created_at,
    updated_at
)
values
    (
        'dddddddd-4444-4444-4444-dddddddddd40',
        'cccccccc-3333-4444-5555-666666666660',
        'aaaaaaaa-1111-1111-1111-aaaaaaaaaaa0',
        'owner',
        'active',
        now(),
        now(),
        now()
    ),
    (
        'eeeeeeee-5555-5555-5555-eeeeeeeeee50',
        'cccccccc-3333-4444-5555-666666666660',
        'bbbbbbbb-2222-2222-2222-bbbbbbbbbbb0',
        'member',
        'active',
        now(),
        now(),
        now()
    );

insert into public.notification_preferences (
    id,
    org_id,
    user_id,
    events,
    announcements,
    devotionals,
    prayer_replies,
    created_at,
    updated_at
)
values (
    'ffffffff-6666-6666-6666-fffffffffff0',
    'cccccccc-3333-4444-5555-666666666660',
    'bbbbbbbb-2222-2222-2222-bbbbbbbbbbb0',
    true,
    true,
    true,
    true,
    now(),
    now()
);

insert into public.device_tokens (
    id,
    org_id,
    user_id,
    token,
    platform,
    last_seen_at,
    disabled_at,
    created_at,
    updated_at
)
values (
    '99999999-7777-7777-7777-999999999970',
    'cccccccc-3333-4444-5555-666666666660',
    'bbbbbbbb-2222-2222-2222-bbbbbbbbbbb0',
    'ExponentPushToken[RLSFixtureMember]',
    'ios',
    now(),
    null,
    now(),
    now()
);

perform tests.clear_auth();

with tables(table_name) as (
    values
        ('organizations'),
        ('organization_members'),
        ('announcements'),
        ('devotionals'),
        ('prayers'),
        ('prayer_reactions'),
        ('events'),
        ('rsvps'),
        ('checkins'),
        ('reports'),
        ('blocks'),
        ('device_tokens'),
        ('notification_preferences')
)
select is(
    (
        select count(*)
        from tables t
        join pg_class c on c.relname = t.table_name
        join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'
        where c.relrowsecurity is not true
    )::integer,
    0,
    'Row level security enabled on all tenant tables'
);

with tables(table_name) as (
    values
        ('organizations'),
        ('organization_members'),
        ('announcements'),
        ('devotionals'),
        ('prayers'),
        ('prayer_reactions'),
        ('events'),
        ('rsvps'),
        ('checkins'),
        ('reports'),
        ('blocks'),
        ('device_tokens'),
        ('notification_preferences')
)
select is(
    (
        select count(*)
        from tables t
        join pg_class c on c.relname = t.table_name
        join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'
        where c.relforcerowsecurity is not true
    )::integer,
    0,
    'Forced RLS enabled on all tenant tables'
);

with tables(table_name) as (
    values
        ('organizations'),
        ('organization_members'),
        ('announcements'),
        ('devotionals'),
        ('prayers'),
        ('prayer_reactions'),
        ('events'),
        ('rsvps'),
        ('checkins'),
        ('reports'),
        ('device_tokens'),
        ('notification_preferences'),
        ('blocks')
)
select is(
    (
        select count(*)
        from tables t
        where not exists (
            select 1
            from pg_policies p
            where p.schemaname = 'public'
              and p.tablename = t.table_name
        )
    )::integer,
    0,
    'Every tenant table has at least one RLS policy'
);

select is_null(auth.uid(), 'Guest context yields NULL auth.uid()');

select results_eq(
    $$ select count(*)::bigint from public.organizations $$,
    $$ values (1::bigint) $$,
    'Guests can view guest-enabled organizations'
);

select results_eq(
    $$ select count(*)::bigint from public.organization_members $$,
    $$ values (0::bigint) $$,
    'Guests cannot see organization roster entries'
);

select results_eq(
    $$ select count(*)::bigint from public.device_tokens $$,
    $$ values (0::bigint) $$,
    'Guests cannot see device tokens'
);

select results_eq(
    $$ select count(*)::bigint from public.notification_preferences $$,
    $$ values (0::bigint) $$,
    'Guests cannot see notification preferences'
);

select finish();

rollback;
