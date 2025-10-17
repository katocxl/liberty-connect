-- demo-org-and-users.sql
-- Seed data with a single tenant and three users

with upsert_user as (
    insert into auth.users (id, instance_id, email, raw_user_meta_data, raw_app_meta_data, aud, role, email_confirmed_at, last_sign_in_at, created_at, updated_at)
    values
        ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'olivia.owner@example.com', jsonb_build_object('full_name', 'Olivia Owner'), jsonb_build_object('default_org', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 'authenticated', 'authenticated', now(), now(), now(), now()),
        ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'mason.moderator@example.com', jsonb_build_object('full_name', 'Mason Moderator'), jsonb_build_object('default_org', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 'authenticated', 'authenticated', now(), now(), now(), now()),
        ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'mia.member@example.com', jsonb_build_object('full_name', 'Mia Member'), jsonb_build_object('default_org', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 'authenticated', 'authenticated', now(), now(), now(), now())
    on conflict (id) do update
    set email = excluded.email,
        raw_user_meta_data = excluded.raw_user_meta_data,
        raw_app_meta_data = excluded.raw_app_meta_data,
        updated_at = now()
    returning 1
)
select 1;

insert into public.organizations (id, name, slug, timezone, allow_guest_access, default_locale, created_at, updated_at)
values (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Liberty Connect Demo',
    'liberty-demo',
    'America/New_York',
    true,
    'en',
    now(),
    now()
)
on conflict (id) do update
set name = excluded.name,
    slug = excluded.slug,
    timezone = excluded.timezone,
    allow_guest_access = excluded.allow_guest_access,
    updated_at = now();

insert into public.organization_members (id, org_id, user_id, role, status, joined_at, created_at, updated_at)
values
    ('aaaa1111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'owner', 'active', now(), now(), now()),
    ('bbbb2222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'moderator', 'active', now(), now(), now()),
    ('cccc3333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'member', 'active', now(), now(), now())
on conflict (org_id, user_id) do update
set role = excluded.role,
    status = excluded.status,
    updated_at = now();

insert into public.announcements (id, org_id, author_id, title, body, hero_image_path, pinned, published_at, expires_at, created_at, updated_at)
values
    ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'Welcome to LibertyConnect', 'Our community space is live! Check out upcoming events and devotionals.', null, true, now() - interval '2 day', null, now() - interval '2 day', now() - interval '2 day'),
    ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Food Drive Volunteers', 'We are gathering supplies Saturday at 10am. Tap into Events to RSVP.', null, false, now() - interval '1 day', now() + interval '5 day', now() - interval '1 day', now() - interval '1 day')
on conflict (id) do update
set title = excluded.title,
    body = excluded.body,
    hero_image_path = excluded.hero_image_path,
    pinned = excluded.pinned,
    published_at = excluded.published_at,
    expires_at = excluded.expires_at,
    updated_at = now();

insert into public.devotionals (id, org_id, author_id, title, scripture_reference, body, published_at, created_at, updated_at)
values
    ('ddddddd1-dddd-dddd-dddd-ddddddddddd1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'Morning Reflection', 'Psalm 46:1', 'Remember that God is our refuge and strength, ready to help in times of trouble.', now() - interval '3 day', now() - interval '3 day', now() - interval '3 day'),
    ('ddddddd2-dddd-dddd-dddd-ddddddddddd2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Gratitude Practice', 'Philippians 4:6', 'Share one thing you are grateful for today with the community.', now() - interval '12 hour', now() - interval '12 hour', now() - interval '12 hour')
on conflict (id) do update
set title = excluded.title,
    scripture_reference = excluded.scripture_reference,
    body = excluded.body,
    published_at = excluded.published_at,
    updated_at = now();

insert into public.events (id, org_id, created_by, title, description, location, location_url, start_at, end_at, all_day, cover_image_path, capacity, created_at, updated_at)
values
    ('eeeeeee1-eeee-eeee-eeee-eeeeeeeeeee1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Saturday Serve', 'Join us to pack care kits for neighbors in need.', '123 Hope Ave, Springfield', 'https://maps.example.com/hope-ave', now() + interval '3 day' + interval '10 hour', now() + interval '3 day' + interval '13 hour', false, null, 40, now() - interval '2 day', now() - interval '2 day'),
    ('eeeeeee2-eeee-eeee-eeee-eeeeeeeeeee2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'Community Brunch', 'Bring your favorite brunch dish to share.', 'Community Hall', null, now() + interval '7 day' + interval '15 hour', now() + interval '7 day' + interval '17 hour', false, null, 60, now() - interval '1 day', now() - interval '1 day')
on conflict (id) do update
set title = excluded.title,
    description = excluded.description,
    location = excluded.location,
    location_url = excluded.location_url,
    start_at = excluded.start_at,
    end_at = excluded.end_at,
    all_day = excluded.all_day,
    cover_image_path = excluded.cover_image_path,
    capacity = excluded.capacity,
    updated_at = now();

insert into public.prayers (id, org_id, author_id, body, is_anonymous, hidden_at, created_at, updated_at)
values
    ('ppppppp1-pppp-pppp-pppp-ppppppppppp1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'Please pray for my job interview on Monday.', false, null, now() - interval '8 hour', now() - interval '8 hour'),
    ('ppppppp2-pppp-pppp-pppp-ppppppppppp2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, 'An unspoken request—God knows the details.', true, null, now() - interval '1 day', now() - interval '1 day')
on conflict (id) do update
set body = excluded.body,
    is_anonymous = excluded.is_anonymous,
    hidden_at = excluded.hidden_at,
    updated_at = now();

insert into public.prayer_reactions (prayer_id, user_id, emoji, created_at)
values
    ('ppppppp1-pppp-pppp-pppp-ppppppppppp1', '11111111-1111-1111-1111-111111111111', '🙏', now() - interval '6 hour'),
    ('ppppppp1-pppp-pppp-pppp-ppppppppppp1', '22222222-2222-2222-2222-222222222222', '❤️', now() - interval '5 hour')
on conflict (prayer_id, user_id, emoji) do update
set created_at = excluded.created_at;

insert into public.rsvps (event_id, user_id, status, notes, created_at, updated_at)
values
    ('eeeeeee1-eeee-eeee-eeee-eeeeeeeeeee1', '11111111-1111-1111-1111-111111111111', 'yes', null, now() - interval '1 day', now() - interval '1 day'),
    ('eeeeeee1-eeee-eeee-eeee-eeeeeeeeeee1', '33333333-3333-3333-3333-333333333333', 'maybe', 'Depends on work schedule', now() - interval '6 hour', now() - interval '6 hour'),
    ('eeeeeee2-eeee-eeee-eeee-eeeeeeeeeee2', '22222222-2222-2222-2222-222222222222', 'yes', null, now() - interval '4 hour', now() - interval '4 hour')
on conflict (event_id, user_id) do update
set status = excluded.status,
    notes = excluded.notes,
    updated_at = now();

insert into public.checkins (id, event_id, user_id, checked_in_at)
values
    ('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'eeeeeee1-eeee-eeee-eeee-eeeeeeeeeee1', '11111111-1111-1111-1111-111111111111', now() - interval '1 day')
on conflict (id) do nothing;

insert into public.notification_preferences (id, org_id, user_id, events, announcements, devotionals, prayer_replies, created_at, updated_at)
values
    ('npnpnpn1-npnp-npnp-npnp-npnpnpnpnpn1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', true, true, true, true, now() - interval '2 day', now() - interval '1 day'),
    ('npnpnpn2-npnp-npnp-npnp-npnpnpnpnpn2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', true, true, true, true, now() - interval '2 day', now() - interval '1 day'),
    ('npnpnpn3-npnp-npnp-npnp-npnpnpnpnpn3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', true, true, false, true, now() - interval '2 day', now() - interval '1 day')
on conflict (org_id, user_id) do update
set events = excluded.events,
    announcements = excluded.announcements,
    devotionals = excluded.devotionals,
    prayer_replies = excluded.prayer_replies,
    updated_at = now();

insert into public.device_tokens (id, org_id, user_id, token, platform, last_seen_at, disabled_at, created_at, updated_at)
values
    ('d3v1c301-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'ExponentPushToken[demo-member-1]', 'ios', now() - interval '30 minute', null, now() - interval '3 day', now() - interval '30 minute')
on conflict (token) do update
set last_seen_at = excluded.last_seen_at,
    disabled_at = excluded.disabled_at,
    updated_at = excluded.updated_at;

insert into public.reports (id, org_id, reporter_id, target_type, target_id, reason, details, status, created_at)
values
    ('r3p0rt01-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'prayer', 'ppppppp2-pppp-pppp-pppp-ppppppppppp2', 'Possible sensitive content', jsonb_build_object('note', 'Shared to flag for moderator review.'), 'open', now() - interval '1 hour')
on conflict (id) do update
set reason = excluded.reason,
    details = excluded.details,
    status = excluded.status;
