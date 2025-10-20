\set ON_ERROR_STOP on

begin;

select plan(6);

-- Seed users and organizations for storage policy coverage.
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
            'aaaa0000-0000-0000-0000-aaaaaaaa0001',
            '00000000-0000-0000-0000-000000000000',
            'storage-a@example.com',
            jsonb_build_object('full_name', 'Storage User A'),
            jsonb_build_object('default_org', 'aaaa1111-1111-1111-1111-aaaaaaaa1111'),
            'authenticated',
            'authenticated',
            now(),
            now(),
            now(),
            now()
        ),
        (
            'bbbb0000-0000-0000-0000-bbbbbbbb0002',
            '00000000-0000-0000-0000-000000000000',
            'storage-b@example.com',
            jsonb_build_object('full_name', 'Storage User B'),
            jsonb_build_object('default_org', 'bbbb2222-2222-2222-2222-bbbbbbbb2222'),
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
values
    (
        'aaaa1111-1111-1111-1111-aaaaaaaa1111',
        'Storage Tenant A',
        'storage-tenant-a',
        'America/Denver',
        false,
        'en',
        now(),
        now()
    ),
    (
        'bbbb2222-2222-2222-2222-bbbbbbbb2222',
        'Storage Tenant B',
        'storage-tenant-b',
        'America/Los_Angeles',
        false,
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
        'aaaa3333-3333-3333-3333-aaaaaaaa3333',
        'aaaa1111-1111-1111-1111-aaaaaaaa1111',
        'aaaa0000-0000-0000-0000-aaaaaaaa0001',
        'owner',
        'active',
        now(),
        now(),
        now()
    ),
    (
        'bbbb4444-4444-4444-4444-bbbbbbbb4444',
        'bbbb2222-2222-2222-2222-bbbbbbbb2222',
        'bbbb0000-0000-0000-0000-bbbbbbbb0002',
        'owner',
        'active',
        now(),
        now(),
        now()
    );

-- Pre-existing files for each tenant.
insert into storage.objects (
    id,
    bucket_id,
    name,
    owner,
    created_at,
    updated_at,
    metadata
)
values
    (
        'aaaa5555-5555-5555-5555-aaaaaaaa5555',
        'announcements',
        'aaaa1111-1111-1111-1111-aaaaaaaa1111/welcome.png',
        'aaaa0000-0000-0000-0000-aaaaaaaa0001',
        now(),
        now(),
        '{}'::jsonb
    ),
    (
        'bbbb6666-6666-6666-6666-bbbbbbbb6666',
        'announcements',
        'bbbb2222-2222-2222-2222-bbbbbbbb2222/update.pdf',
        'bbbb0000-0000-0000-0000-bbbbbbbb0002',
        now(),
        now(),
        '{}'::jsonb
    );

perform tests.set_authenticated_user('aaaa0000-0000-0000-0000-aaaaaaaa0001');

select results_eq(
    $$ select count(*)::bigint from storage.objects $$,
    $$ values (1::bigint) $$,
    'Tenant A member only sees objects scoped to their org'
);

with allowed_insert as (
    insert into storage.objects (id, bucket_id, name, owner, created_at, updated_at, metadata)
    values (
        'aaaa7777-7777-7777-7777-aaaaaaaa7777',
        'announcements',
        'aaaa1111-1111-1111-1111-aaaaaaaa1111/newsletter.pdf',
        'aaaa0000-0000-0000-0000-aaaaaaaa0001',
        now(),
        now(),
        '{}'::jsonb
    )
    returning 1
)
select is(
    (select count(*) from allowed_insert)::integer,
    1,
    'Tenant A member can upload into their managed bucket path'
);

select throws_like(
    $$ insert into storage.objects (id, bucket_id, name, owner, created_at, updated_at, metadata)
       values (
           'aaaa8888-8888-8888-8888-aaaaaaaa8888',
           'announcements',
           'bbbb2222-2222-2222-2222-bbbbbbbb2222/forbidden.png',
           'aaaa0000-0000-0000-0000-aaaaaaaa0001',
           now(),
           now(),
           '{}'::jsonb
       ) $$,
    '%row-level security%',
    'Tenant A member cannot upload into another org path'
);

perform tests.set_authenticated_user('bbbb0000-0000-0000-0000-bbbbbbbb0002');

select results_eq(
    $$ select count(*)::bigint
       from storage.objects
       where name like 'aaaa1111-1111-1111-1111-aaaaaaaa1111/%' $$,
    $$ values (0::bigint) $$,
    'Tenant B member cannot read Tenant A files'
);

select results_eq(
    $$ select count(*)::bigint from storage.objects $$,
    $$ values (1::bigint) $$,
    'Tenant B member sees only their managed objects'
);

perform tests.clear_auth();

select results_eq(
    $$ select count(*)::bigint from storage.objects $$,
    $$ values (0::bigint) $$,
    'Guests cannot read protected storage objects'
);

select finish();

rollback;
