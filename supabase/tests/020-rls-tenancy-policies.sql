\set ON_ERROR_STOP on

begin;

select plan(8);

-- Seed two-org fixture to validate tenant isolation.
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
            '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
            '00000000-0000-0000-0000-000000000000',
            'owner-a@example.com',
            jsonb_build_object('full_name', 'Owner A'),
            jsonb_build_object('default_org', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeee1'),
            'authenticated',
            'authenticated',
            now(),
            now(),
            now(),
            now()
        ),
        (
            '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
            '00000000-0000-0000-0000-000000000000',
            'owner-b@example.com',
            jsonb_build_object('full_name', 'Owner B'),
            jsonb_build_object('default_org', 'bbbbbbbb-cccc-dddd-eeee-fffffffffff2'),
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
        'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeee1',
        'Tenant Alpha',
        'tenant-alpha',
        'America/New_York',
        false,
        'en',
        now(),
        now()
    ),
    (
        'bbbbbbbb-cccc-dddd-eeee-fffffffffff2',
        'Tenant Beta',
        'tenant-beta',
        'America/Chicago',
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
        'aaaa1111-bbbb-cccc-dddd-eeeeffff0001',
        'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeee1',
        '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
        'owner',
        'active',
        now(),
        now(),
        now()
    ),
    (
        'bbbb2222-cccc-dddd-eeee-ffffaaaa0002',
        'bbbbbbbb-cccc-dddd-eeee-fffffffffff2',
        '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
        'owner',
        'active',
        now(),
        now(),
        now()
    );

insert into public.announcements (
    id,
    org_id,
    author_id,
    title,
    body,
    hero_image_path,
    pinned,
    published_at,
    expires_at,
    created_at,
    updated_at
)
values
    (
        'annaa111-aaaa-aaaa-aaaa-aaaaaaaaaa01',
        'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeee1',
        '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
        'Alpha Family Night',
        'Bring the whole family for games and dinner.',
        null,
        false,
        now() - interval '1 day',
        null,
        now() - interval '1 day',
        now() - interval '1 day'
    ),
    (
        'annbb222-bbbb-bbbb-bbbb-bbbbbbbbbb02',
        'bbbbbbbb-cccc-dddd-eeee-fffffffffff2',
        '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
        'Beta Weekend Retreat',
        'Retreat schedule and packing list attached.',
        null,
        false,
        now() - interval '1 day',
        null,
        now() - interval '1 day',
        now() - interval '1 day'
    );

insert into public.events (
    id,
    org_id,
    created_by,
    title,
    description,
    location,
    location_url,
    start_at,
    end_at,
    all_day,
    cover_image_path,
    capacity,
    created_at,
    updated_at
)
values
    (
        'eventaa11-aaaa-aaaa-aaaa-aaaaaaaaaa11',
        'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeee1',
        '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
        'Alpha Serve Day',
        'Serve together at the community center.',
        '123 Hope St',
        null,
        now() + interval '2 day',
        now() + interval '2 day' + interval '3 hour',
        false,
        null,
        40,
        now(),
        now()
    ),
    (
        'eventbb22-bbbb-bbbb-bbbb-bbbbbbbbbb22',
        'bbbbbbbb-cccc-dddd-eeee-fffffffffff2',
        '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
        'Beta Worship Night',
        'Join us for an evening of worship.',
        '456 Unity Rd',
        null,
        now() + interval '5 day',
        now() + interval '5 day' + interval '2 hour',
        false,
        null,
        60,
        now(),
        now()
    );

insert into public.prayers (
    id,
    org_id,
    author_id,
    body,
    is_anonymous,
    hidden_at,
    created_at,
    updated_at
)
values
    (
        'prayaa11-aaaa-aaaa-aaaa-aaaaaaaaaa31',
        'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeee1',
        '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
        'Pray for the Alpha outreach team traveling this weekend.',
        false,
        null,
        now() - interval '2 hour',
        now() - interval '2 hour'
    ),
    (
        'prayerbb22-bbbb-bbbb-bbbb-bbbbbbbbbb32',
        'bbbbbbbb-cccc-dddd-eeee-fffffffffff2',
        '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
        'Lift up the Beta youth as they start exams.',
        false,
        null,
        now() - interval '3 hour',
        now() - interval '3 hour'
    );

perform tests.set_authenticated_user('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaa1');

select results_eq(
    $$ select count(*)::bigint
       from public.announcements
       where org_id = 'bbbbbbbb-cccc-dddd-eeee-fffffffffff2' $$,
    $$ values (0::bigint) $$,
    'Org A owner cannot see Org B announcements'
);

select results_eq(
    $$ select count(*)::bigint
       from public.events
       where org_id = 'bbbbbbbb-cccc-dddd-eeee-fffffffffff2' $$,
    $$ values (0::bigint) $$,
    'Org A owner cannot see Org B events'
);

select results_eq(
    $$ select count(*)::bigint
       from public.prayers
       where org_id = 'bbbbbbbb-cccc-dddd-eeee-fffffffffff2' $$,
    $$ values (0::bigint) $$,
    'Org A owner cannot see Org B prayers'
);

with own_update as (
    update public.announcements
    set title = 'Alpha Family Night (Updated)'
    where id = 'annaa111-aaaa-aaaa-aaaa-aaaaaaaaaa01'
    returning 1
)
select is(
    (select count(*) from own_update)::integer,
    1,
    'Org A owner can update announcements in their org'
);

with cross_update as (
    update public.announcements
    set title = 'Beta Weekend Retreat (Tampered)'
    where id = 'annbb222-bbbb-bbbb-bbbb-bbbbbbbbbb02'
    returning 1
)
select is(
    (select count(*) from cross_update)::integer,
    0,
    'Org A owner cannot update announcements in another org'
);

perform tests.set_authenticated_user('22222222-bbbb-bbbb-bbbb-bbbbbbbbbbb2');

select results_eq(
    $$ select count(*)::bigint
       from public.announcements
       where org_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeee1' $$,
    $$ values (0::bigint) $$,
    'Org B owner cannot see Org A announcements'
);

select results_eq(
    $$ select count(*)::bigint
       from public.events
       where org_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeee1' $$,
    $$ values (0::bigint) $$,
    'Org B owner cannot see Org A events'
);

select results_eq(
    $$ select count(*)::bigint
       from public.prayers
       where org_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeee1' $$,
    $$ values (0::bigint) $$,
    'Org B owner cannot see Org A prayers'
);

select finish();

rollback;
