# Community Engagement Platform — Logic Flow & Build Guide (Expo + Supabase)

**Goal**: A production-ready mobile app for community engagement (Devotionals, Announcements, Prayer Wall) plus Event management with T‑minus reminders and deep links. Content can be time‑gated. Authentication is designed fully but **enabled last** after all core flows are verified.

> This document is opinionated and implementation-ready: it specifies data models, policies (RLS), cron/scheduled jobs, deep links, moderation, offline, and admin testing/impersonation. **CI/CD & Observability are out of scope here** (handled separately).

---

## 0) High‑level Architecture

- **Client**: Expo (React Native), Expo Router, TanStack Query, FlashList, AsyncStorage, expo-notifications, expo-linking.
- **Backend**: Supabase (Postgres + RLS, Realtime, Storage, Auth), Edge Functions (Deno) for push send/receipts, admin flows, and secure operations.
- **Scheduling**: Supabase Cron / Scheduled Functions (pg_cron + pg_net) for event reminders, TTL sweeps, report SLAs.
- **Tenancy**: Multi‑community (organizations) enforced in **RLS** across tables and Storage.
- **Moderation**: Reports, blocks/mutes, admin review queue, and rate limits.
- **Auth stance**: Start with **anonymous/guest** sessions for read, then enable **passwordless (Magic Link/OTP)** and upgrade anonymous users to permanent accounts. Admin can impersonate users for test/debug via a secure flow.
- **Deep links**: Scheme + iOS Universal Links + Android App Links opening to `/event/[id]`, `/announcement/[id]`, `/prayer/[id]`.
- **Out of scope in this file**: EAS Build/Submit/Update, Sentry, Detox, etc.

---

## 1) Build Order (chronological, minimal back‑tracking)

1. **Scaffold UI shells** (no auth): Home tabs (Devotionals, Announcements, Prayer, Events), detail screens, “Report” and “Block” actions, and a basic Admin screen stub (hidden).
2. **Database & Storage**: Create tables (below), enable RLS, seed with demo org and content, set up Storage buckets (`events`, `announcements`, `avatars`), and indexes.
3. **Read flows**: Query time‑gated content and events; FlashList renders. Add search (FTS) on Announcements & Prayer.
4. **Realtime & Mutations**: Post a prayer, react, report, RSVP. Use optimistic updates + Realtime subscriptions.
5. **Moderation**: Report queue, auto‑hide threshold, block/mute, and simple rate limits.
6. **Notifications**: Device token lifecycle, preference categories, T‑30 event reminders, deep link payloads, receipt handling & token pruning.
7. **Offline**: Persist Query cache to AsyncStorage; add skeleton states & stale‑while‑revalidate.
8. **Auth (last)**: Turn on anonymous sessions first, then add Magic Link/OTP, upgrade flow, role claims, and lock down mutating routes.
9. **Admin testing**: Secure **impersonation** and Admin review tools; audit logs.
10. **Store readiness**: UGC policy checklist in UI (report/block), Terms/Privacy, data export & deletion.

---

## 2) Data Model (core tables)

> All tables: `created_at timestamptz default now()`, `id uuid default gen_random_uuid()` (unless stated), and `org_id uuid` (except `organizations`). Enable RLS on every table.

### 2.1 Organizations & Membership
- **organizations**: `id`, `name`, `slug`, `is_active`
- **profiles**: `user_id uuid pk`, `display_name`, `avatar_url`
- **organization_members**: `org_id`, `user_id`, `role text` (`member|moderator|admin|owner`), `joined_at`
  - Unique `(org_id, user_id)`
  - Indexes: `org_id`, `user_id`, `role`

### 2.2 Content
- **announcements**: `id`, `org_id`, `author_id`, `title`, `body`, `images text[]`, `published_at`, `expires_at`, `is_pinned boolean`
- **devotionals**: `id`, `org_id`, `author_id`, `title`, `body_md`, `images text[]`, `published_at`, `expires_at`
- **prayers**: `id`, `org_id`, `author_id`, `body`, `images text[]`, `is_hidden boolean default false` (auto‑hide on threshold), `published_at`
- **prayer_reactions**: `prayer_id`, `user_id`, `emoji text`, unique (`prayer_id`, `user_id`, `emoji`)
- **reports**: `id`, `org_id`, `reporter_id`, `target_type text` (`prayer|comment|user`), `target_id uuid`, `reason text`, `status text` (`open|actioned|dismissed`), `handled_by uuid null`, `handled_at`
- **blocks**: `blocker_id`, `blocked_id`, unique pair, per‑org optional
- **notification_preferences**: `user_id`, `org_id`, `events boolean default true`, `announcements boolean default true`, `devotionals boolean default true`, `prayer_replies boolean default true`

### 2.3 Events
- **events**: `id`, `org_id`, `title`, `description`, `start_at`, `end_at`, `location`, `capacity int null`, `recurrence_json jsonb null`, `cover_image text`
- **rsvps**: `event_id`, `user_id`, `status text` (`yes|no|maybe`), `updated_at`
  - Unique (`event_id`, `user_id`)
- **checkins**: `event_id`, `user_id`, `checked_in_at`

### 2.4 Push & Admin
- **device_tokens**: `user_id`, `token text`, `platform text` (`ios|android|web`), `last_seen_at`, `disabled_at`
  - Unique (`user_id`, `token`)
- **admin_actions**: `id`, `admin_id`, `action text`, `target_type text`, `target_id uuid`, `metadata jsonb` (e.g., `{"impersonated_user_id": "…"}`)

### 2.5 Search
- **announcement_search** (materialized or generated): `tsvector` over `title || ' ' || body`
- **prayer_search**: `tsvector` over `body`
  - Add `GIN` index on the `tsvector` columns; optional `pg_trgm` on `title` for fuzzy matching.

---

## 3) Row Level Security (RLS) essentials

### 3.1 Common predicates
- **Is org member?**
  ```sql
  create or replace function is_member(org uuid)
  returns boolean language sql stable as $$
    select exists (
      select 1 from organization_members m
      where m.org_id = org and m.user_id = auth.uid()
    );
  $$;
  ```
- **Is moderator/admin?**
  ```sql
  create or replace function has_role(org uuid, roles text[])
  returns boolean language sql stable as $$
    select exists (
      select 1 from organization_members m
      where m.org_id = org and m.user_id = auth.uid()
        and m.role = any(roles)
    );
  $$;
  ```

### 3.2 Example policies
- **Announcements / Devotionals (read within org; respect time‑gates)**
  ```sql
  alter table announcements enable row level security;
  create policy "read_announcements_in_org"
    on announcements for select
    using (
      is_member(org_id)
      and (published_at is null or published_at <= now())
      and (expires_at   is null or expires_at   >  now())
    );
  -- writes only by moderators/admins
  create policy "write_announcements_mods"
    on announcements for all
    using (has_role(org_id, array['moderator','admin','owner']))
    with check (has_role(org_id, array['moderator','admin','owner']));
  ```
- **Prayers (members can read/post; auto‑hide respected)**
  ```sql
  alter table prayers enable row level security;
  create policy "read_prayers_in_org"
    on prayers for select using (is_member(org_id) and is_hidden = false);

  create policy "post_prayer_member"
    on prayers for insert with check (is_member(org_id));
  ```
- **RSVPs (user manages own RSVP)**
  ```sql
  alter table rsvps enable row level security;
  create policy "read_rsvps_in_org"
    on rsvps for select using (is_member((select org_id from events e where e.id = rsvps.event_id)));
  create policy "upsert_own_rsvp"
    on rsvps for insert with check (auth.uid() = user_id)
    ;
  create policy "update_own_rsvp"
    on rsvps for update using (auth.uid() = user_id);
  ```

### 3.3 Storage (images)
- Buckets: `events`, `announcements`, `avatars`
- Enforce via RLS on `storage.objects` path conventions (e.g., `events/{org_id}/…`). Grant `insert/select` if `is_member(org_id_from_path(name))`.

---

## 4) Time‑Gated Content & Queries

- **Show only current** (announcements/devotionals):
  ```sql
  select * from announcements
  where org_id = :org
    and coalesce(published_at, now()) <= now()
    and (expires_at is null or expires_at > now())
  order by is_pinned desc, published_at desc
  limit 50;
  ```
- **Auto‑expire** via cron sweep (see §8).

---

## 5) Events & Reminders

### 5.1 Reminder rule
- Send **T‑30 minutes** push to `RSVP yes` (and optionally `maybe`) with a deep link to `/event/[id]`.

### 5.2 Scheduled Function (minute window + drift‑safe)
```sql
-- runs every minute; pick a 2‑minute window around T‑30
with upcoming as (
  select e.id as event_id, e.org_id
  from events e
  where e.start_at between (now() + interval '29 min') and (now() + interval '31 min')
)
select r.event_id, r.user_id
from rsvps r
join upcoming u on u.event_id = r.event_id
where r.status = 'yes';
```

### 5.3 Edge Function: `send-event-reminders`
- Steps:
  1. Fetch eligible RSVPs + user device tokens (join `device_tokens` + `notification_preferences.events = true`).
  2. **De‑dupe** tokens; chunk sends to Expo Push API.
  3. Include **deep link**: `data.url = myapp://event/<id>` (plus universal/app link URLs).
  4. Store tickets; schedule a **receipts** check to prune tokens marked `DeviceNotRegistered` and set `disabled_at`.
  5. Upsert `last_seen_at` for tokens seen during app usage.

- Device token lifecycle:
  - On app start / sign‑in: register token → upsert (`user_id`, `token`, `platform`, `last_seen_at=now()`).
  - On logout / uninstall detection (via receipts): mark `disabled_at` and stop sending.

---

## 6) Deep Links (Expo Router)

- Configure **custom scheme** (e.g., `myapp://`) and **Universal/App Links** for production.
- Route structure: `/event/[id]`, `/announcement/[id]`, `/prayer/[id]`.
- Push payload includes `data.url` so tapping opens the correct screen whether app is cold, backgrounded, or foregrounded.
- Guarded routes: if action requires auth, display **sign‑in modal** and continue once complete.

---

## 7) Moderation & UGC Compliance

- **Report** any prayer/post/user → creates `reports` row; item is **auto‑hidden** when report count ≥ threshold (per org setting) until a moderator reviews.
- **Block/Mute**: users can block other users (hide their content locally and in feeds).
- **Admin queue**: moderators can `action` (remove content / warn) or `dismiss` reports; audit every action to `admin_actions` with metadata.
- **Rate limits** (simple): RPC/Edge Function gate for posting that rejects if user posted > N items in last interval (e.g., 5/min). Backed by an indexed count on `prayers(author_id, created_at)`. Advanced: Redis-based counters.
- **Store‑ready**: clear Terms/Privacy links; in‑app reporting & blocking; respond to reports within 24h.

---

## 8) Cron Jobs & Housekeeping

- **Event reminders**: Every minute → invoke `send-event-reminders` (see §5).
- **Push receipts**: Every 10 minutes → check receipts and clean dead tokens.
- **TTL sweep**: Hourly → auto‑hide expired content (set `is_hidden` or soft delete), prune orphaned Storage with signed URL expiry.
- **Report SLA**: Hourly → nudge admins with count of `reports.status='open'` older than 12h.

_Supabase Hosted: use **Scheduled Functions / Cron** in dashboard; local/dev: use SQL `cron.schedule`._

---

## 9) Realtime, Offline & Performance

- **Realtime**: subscribe to `prayers`, `prayer_reactions`, `announcements` (insert/update) for live updates; reconcile with optimistic cache.
- **Offline**: TanStack Query `persistQueryClient` with AsyncStorage. Cache core lists & details; hydrate on focus.
- **Lists**: FlashList for large feeds; set `getItemType` for heterogeneous cells; avoid re‑renders (memo cells; stable keys).

---

## 10) Search (FTS + optional fuzzy)

- **FTS**: `tsvector` columns and GIN indexes on `announcements(title, body)` and `prayers(body)`.
  ```sql
  alter table announcements add column searchable tsvector
    generated always as (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(body,''))) stored;
  create index idx_announcements_search on announcements using gin (searchable);
  -- query
  select id, title, ts_rank_cd(searchable, plainto_tsquery('english', :q)) as rank
  from announcements
  where org_id = :org and searchable @@ plainto_tsquery('english', :q)
  order by rank desc, published_at desc
  limit 50;
  ```
- **Fuzzy**: enable `pg_trgm` and add trigram index on `title` for tolerant matches.

---

## 11) Authentication (implemented last but designed now)

### 11.1 Stance
- **Before enabling**: app runs in guest mode; reads allowed; write actions open a **sign‑in modal**.
- **Phase 1**: **Anonymous sessions** (`signInAnonymously`) → allow low‑risk writes (e.g., RSVP, reactions) with rate‑limits.
- **Phase 2**: **Passwordless** (Magic Link / OTP). Offer upgrade path from anonymous → permanent account **without data loss** by linking the existing `user_id`.
- **Roles**: per‑org role in `organization_members.role` governs authoring & moderation privileges via RLS.

### 11.2 Client patterns
- Session provider; `useAuth` hook; Protected routes that gate mutations behind a modal.
- Auth UI: magic‑link email and code (OTP) fallback. Respect throttling messages.

### 11.3 Policy notes for anonymous
- Use `auth.jwt() ->> 'is_anonymous'` in policies to **disallow admin/mod actions** and certain writes until upgraded.
  ```sql
  -- example check for non-anonymous poster
  with check ( coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false )
  ```

---

## 12) Admin Access & Impersonation (for testing)

### 12.1 Admin role
- Bootstrap one **owner** user in `organization_members` with role `owner` (and optionally `admin`). Admin UI is only visible for users with these roles (checked client‑side and server‑side via RLS).

### 12.2 Safe **User Impersonation** options
1) **Supabase Studio “User Impersonation”** (fastest): In the dashboard, impersonate a user to validate RLS and data visibility without code changes.
2) **Programmatic Magic Link impersonation** (Edge Function):
   - Secure Edge Function (service role) generates a **Magic Link** for a target user (by email or `user_id`), returns the URL to the admin client, and **audits** the action in `admin_actions`.
   - Open the link in an **incognito** session to experience the app as that user. On exit, sign out and return to admin mode.
   - This method never exposes the service role in the client; the Edge Function is the only place holding it.

   **Pseudo (Deno)**
   ```ts
   // functions/impersonate/index.ts
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
   import { serve } from 'https://deno.land/std/http/server.ts'

   serve(async (req) => {
     // 1) Verify the caller is an admin (e.g., JWT from Admin, or check org role via DB)
     const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SERVICE_ROLE_KEY')!)
     const { user_id, email } = await req.json()

     // 2) Generate a magic link for the target user
     const { data, error } = await supabaseAdmin.auth.admin.generateLink({
       type: 'magiclink',
       email, // or look up by user_id to get email
     })
     if (error) return new Response(error.message, { status: 400 })

     // 3) Audit the action
     await supabaseAdmin.from('admin_actions').insert({
       admin_id: '<caller_user_id>',
       action: 'impersonate',
       target_type: 'user',
       target_id: data.user?.id,
       metadata: { link_type: 'magiclink' }
     })

     return new Response(JSON.stringify({ url: data.properties?.action_link }), { headers: { 'content-type': 'application/json' } })
   })
   ```

### 12.3 “Preview as user” (non-auth) technique
- For UI-only checks, allow admins to **preview** feeds filtered as a selected user **without** changing auth (server‑side SQL with injected `preview_user_id` in an admin‑only function). This avoids session switching.

### 12.4 Kill‑switch
- Admin view should show a red **“Exit Impersonation”** banner; sign‑out destroys the impersonated session immediately.

---

## 13) Notification Preferences & Permissions

- Ask for push permission **in context** (“Enable reminders 30 minutes before events?”).
- Preferences per category (`notification_preferences`) + per‑org toggles.
- Respect device/platform differences; do not crash if push token is missing/invalid; always deep link.

---

## 14) Rate Limiting (simple, DB‑only option)

- Example RPC that rejects if >5 prayers in last minute:
  ```sql
  create or replace function can_post_prayer(org uuid)
  returns boolean language sql stable as $$
    select count(*) < 5
    from prayers
    where author_id = auth.uid()
      and org_id = org
      and created_at > now() - interval '1 minute';
  $$;
  ```
  - Call this in an **Edge Function** that performs the insert; if false, return 429 to the client.
  - For higher scale, use Redis counters in an Edge Function; keep DB hot path lean.

---

## 15) Example Client Patterns (snippets)

### 15.1 Persisted cache (offline)
```tsx
const queryClient = new QueryClient()
const persistor = createAsyncStoragePersister({ storage: AsyncStorage })

return (
  <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: persistor }}>
    <App />
  </PersistQueryClientProvider>
)
```

### 15.2 Device token register
```ts
const token = await Notifications.getExpoPushTokenAsync()
await supabase.from('device_tokens').upsert({ user_id: session?.user.id, token: token.data, platform: Platform.OS })
```

### 15.3 Deep link from push
```ts
Notifications.addNotificationResponseReceivedListener((res) => {
  const url = res.notification.request.content.data?.url
  if (url) Linking.openURL(url)
})
```

---

## 16) Store Readiness Checklist (UGC)

- In‑app **Report** flow for content/users (with contact email in app).
- **Block** abusive users.
- **Timely moderation** (target: within 24 hours).
- Terms of Use & Privacy Policy links in settings.
- Data **export & deletion** path on request.
- Age‑appropriate content disclaimers if needed.

---

## 17) Appendix — Suggested Indexes

- `events(org_id, start_at)`; `rsvps(event_id, user_id)` unique; `prayers(org_id, created_at desc)`; `reports(org_id, status, created_at)`
- FTS GIN on `announcement_search`, `prayer_search`
- Trigram on `announcements.title` (optional)
- `device_tokens(user_id, token)` unique; `device_tokens(disabled_at nulls first)`
- `organization_members(org_id, user_id)` unique
- `notification_preferences(user_id, org_id)` unique

---

## 18) Risks & Mitigations

- **Token bloat / invalid tokens** → prune via receipts, mark `disabled_at`, de‑dupe per send.
- **Spam / abuse** → rate limits, report auto‑hide thresholds, block/mute, and an admin SLA.
- **Clock drift** for T‑30 → 2‑minute selection window.
- **Data leakage across orgs** → enforce `org_id` RLS on **every** table + Storage paths.

---

## 19) What to implement next (after this file)

- Turn on Anonymous Auth → wire modal gating for writes.
- Build admin queue UI (reports, impersonation launcher, audit table view).
- Connect Scheduled Functions (reminders, receipts, TTL).
- Prepare Terms/Privacy pages.
- (Separate doc covers CI/CD & observability.)

---

### End