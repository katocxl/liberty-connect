
# LibertyConnect — Codex Task Plan

**Purpose**: Give Codex a crystal-clear, step-by-step plan to populate the codebase. Each task is atomic, has strict inputs/outputs, files to touch, and *Definition of Done* (DoD). Follow the tasks **in order** to minimize back-and-forth.

> Stacks: Expo (Router, Notifications), Supabase (Postgres + RLS, Auth, Storage, Edge Functions), TanStack Query (with AsyncStorage persist), FlashList. Deep linking via custom scheme + Universal/App Links. Scheduling via Supabase Cron + Scheduled Functions.  
> CI/CD & Observability are handled elsewhere.

---

## 0) Ground Rules for Codex

- **Contract-first**: implement types/interfaces and DB migrations before UI/Edge code.
- **Tenant safety**: every query filtered by `org_id`; never select cross-tenant data.
- **No secrets in client**: service role keys only in Edge Functions.
- **Idempotency**: all Edge Functions must be safe to retry.
- **Accessibility**: touch targets ≥44px, labels on tappables; error states present.
- **Testing hooks**: keep simple unit seams; DB has pgTAP tests for policies.
- **Offline**: wrap app in `PersistQueryClientProvider` and persist via AsyncStorage.

---

## 1) Prerequisites (one-time)

**Files**: `mobile/src/types/database.types.ts`, `mobile/src/lib/supabase.ts`, `.env`, `supabase/config.toml`

- **T-1.1 Generate Supabase types**
  - Run: `supabase gen types typescript --project-id <id> --schema public > mobile/src/types/database.types.ts`
  - Create `mobile/src/lib/supabase.ts` exporting a typed `createClient<Database>()`.
  - **DoD**: `Database` type compiles; app builds.

- **T-1.2 Environment sanity**
  - Ensure `.env` and `.env.production` have URLs, anon keys; `SERVICE_ROLE_KEY` only on server.
  - **DoD**: App boots in dev; functions see env via `Deno.env.get()`.

---

## 2) Database & Migrations (schema-first)

**Files**: `supabase/migrations/030_storage_policies.sql`, `040_search_fts.sql`, `050_rls_policies.sql`, `seed/demo-org-and-users.sql`

- **T-2.1 Storage buckets & RLS**
  - Buckets: `events`, `announcements`, `avatars`.
  - Path: `bucket/{org_id}/...` and RLS on `storage.objects` granting org members select/insert.
  - **DoD**: Upload by member succeeds; cross-org read/write denied.

- **T-2.2 Full-Text Search**
  - Add `tsvector` on Announcements(title+body) & Prayers(body) + GIN indexes.
  - **DoD**: `plainto_tsquery('english', 'hope')` returns ranked rows.

- **T-2.3 Core RLS policies**
  - Policies for: organizations, organization_members, announcements, devotionals, prayers, prayer_reactions, events, rsvps, checkins, reports, blocks, device_tokens, notification_preferences.
  - **DoD**: Non-members denied; members read; role-gated writes work.

- **T-2.4 Seed demo org**
  - One org, 3 users (owner, moderator, member) and basic content/events.
  - **DoD**: Seed runs; app lists data without auth (guest mode).

---

## 3) Scheduled Jobs (Cron + Scheduled Functions)

**Files**: `supabase/migrations/020_cron_reminders.sql`, `supabase/migrations/010_cron_ttls.sql`

- **T-3.1 Event reminder cron**
  - Schedule every minute to call `functions/event_reminder_30m` (drift-safe +/- 1m window around T-30).
  - **DoD**: Cron visible in Dashboard; function receives payload; logs show sends.

- **T-3.2 Housekeeping/TTL cron**
  - Hourly TTL sweep for `expires_at`, report age summary.
  - **DoD**: Expired items hidden; open report counts emitted to logs.

---

## 4) Edge Functions

> All functions in `supabase/functions/**/index.ts` with shared helpers in `_shared/*`. Use Deno + `@supabase/supabase-js@2`.

- **T-4.1 `save_device_token`**
  - Upsert `{ user_id, token, platform, last_seen_at }` and respect `disabled_at`.
  - **DoD**: Multiple devices per user OK; upsert idempotent.

- **T-4.2 `event_reminder_30m`**
  - Query RSVPs (`yes`) for events starting in 29–31 min; join tokens + `notification_preferences.events`.
  - De-dupe tokens; chunk send to Expo; include deep link `data.url` (`myapp://event/<id>`).
  - **DoD**: Test log shows N pushes; empty set handled gracefully.

- **T-4.3 `push_receipts`**
  - Poll Expo receipts; prune tokens with `DeviceNotRegistered` by setting `disabled_at`.
  - **DoD**: Tokens marked disabled when receipts error; unaffected tokens untouched.

- **T-4.4 `notification_prefs_upsert`**
  - Save per-category toggles (`events, announcements, devotionals, prayer_replies`) per org.
  - **DoD**: Round-trip from app settings works; defaults created on first save.

- **T-4.5 `report_action`**
  - Admin-only: action/dismiss reports, hide/unhide target, audit to `admin_actions`.
  - **DoD**: Non-admin forbidden; actions recorded atomically.

- **T-4.6 `impersonate`**
  - Admin-only: generate Magic Link for target user; return `action_link` JSON; audit action.
  - **DoD**: Link opens session as target in incognito; audit row created.

- **T-4.7 `search`**
  - Expose FTS query endpoint for announcements/prayers with `q`, `org_id`, pagination.
  - **DoD**: Ranked results; SQL injection-safe params.

---

## 5) Mobile App — Core Infrastructure

**Files**: `mobile/src/lib/queryClient.ts`, `mobile/src/store/auth.ts`, `mobile/src/features/notifications/*`, `mobile/src/constants/links.ts`

- **T-5.1 Query persistence**
  - Wrap app in `PersistQueryClientProvider`; AsyncStorage persister; sensible GC/cache times.
  - **DoD**: Cached lists available offline; refetch on focus.

- **T-5.2 Deep linking**
  - Implement helpers in `constants/links.ts` to build screen URLs.
  - Wire `handleNotificationTap.ts` to open `data.url`.
  - **DoD**: Cold/warm app opens to the right screen from a push.

- **T-5.3 Push registration**
  - Request permission contextually; register with Edge `save_device_token`.
  - **DoD**: Token saved with platform; re-register updates `last_seen_at`.

---

## 6) Mobile App — Features

**Announcements & Devotionals**
- **T-6.1 APIs & hooks**
  - Implement `features/announcements/api.ts` and hooks for list/read; include time-gating (`published_at/expires_at`).
  - **DoD**: List screen shows only current items, sorted by pinned then time.

**Prayer Wall**
- **T-6.2 Post & list**
  - Implement `prayer/api.ts` and hooks; optimistic post; realtime subscribe; local block list applied.
  - **DoD**: New posts appear live; blocked users hidden.

- **T-6.3 Reactions**
  - `usePrayerReaction.ts` upsert reaction with unique (prayer_id, user_id, emoji).
  - **DoD**: Reaction toggles without duplicates.

- **T-6.4 Report**
  - Modal `app/(modals)/report.tsx` and API to create `reports` rows.
  - **DoD**: Report increments count; auto-hide applied when threshold reached.

**Events**
- **T-6.5 Events list/detail**
  - Implement `events/api.ts`, `useEvents`, `useEvent`; detail shows cover, time, map/location link.
  - **DoD**: Time shown in local TZ; past events indicated.

- **T-6.6 RSVP**
  - `useRSVP.ts` upsert own RSVP; UI button reflects `yes|no|maybe`.
  - **DoD**: Change is reflected immediately; works offline then syncs.

**Search**
- **T-6.7 Search UI**
  - `features/search/*` basic search bar; debounce; call `functions/search`.
  - **DoD**: Ranked results; empty state friendly.

**Preferences**
- **T-6.8 Settings screen**
  - `app/settings.tsx` for category toggles and Terms/Privacy links.
  - **DoD**: Toggles persist; links open webview.

**Moderation**
- **T-6.9 Admin queue**
  - `app/admin/reports.tsx` lists open reports; action/dismiss via `report_action`.
  - **DoD**: Actions update UI; audit entries visible.

**Admin Impersonation**
- **T-6.10 Impersonate UI**
  - `app/admin/impersonate.tsx` form to request Magic Link; shows warning banner during impersonation.
  - **DoD**: Link generation works; “Exit Impersonation” signs out cleanly.

---

## 7) Authentication (enabled last)

**Files**: `mobile/src/store/auth.ts`, `mobile/app/(auth)/*`, RLS policies

- **T-7.1 Anonymous sessions**
  - Call `signInAnonymously()` on first run; tag `is_anonymous` in policies to restrict admin actions.
  - **DoD**: Guest can read + limited writes (RSVP, reactions, report).

- **T-7.2 Magic Link/OTP**
  - Email-based sign-in; “upgrade account” path merges anonymous user’s data.
  - **DoD**: After upgrade, previous content is owned by the permanent user.

- **T-7.3 Gate mutations**
  - Protected-route pattern: if non-auth tries to post/edit admin-only content, open sign-in modal.
  - **DoD**: UX flow clear; no dead ends.

---

## 8) Tests (database + app seams)

**Files**: `supabase/tests/*.sql`, `mobile/src/tests/*`

- **T-8.1 RLS enabled everywhere**
  - pgTAP: verify `pg_policies` exists and blocks anon where expected.
  - **DoD**: Tests pass locally via `supabase test` (or psql).

- **T-8.2 Tenancy isolation**
  - pgTAP: cross-org selects/updates denied.
  - **DoD**: Negative tests succeed (denied).

- **T-8.3 Storage policies**
  - pgTAP: member of org can read/write their bucket path; others denied.
  - **DoD**: All green.

---

## 9) Prompts for Codex (copy-paste for each cluster)

> Use these as the **system prompt** + **file context** when asking Codex to implement code.

### P-1: Edge Function boilerplate
**System**: “You are writing Supabase Edge Functions in Deno with `@supabase/supabase-js@2`. Functions must be idempotent, typed, and never leak service keys to the client.”  
**Context**: `supabase/functions/_shared/{supabase.ts,push.ts,http.ts}` + target `index.ts`  
**Ask**: “Implement `<function>` as specified in Task T-4.x. Accept JSON input, validate, perform DB actions, return JSON. Add structured logs.”

### P-2: FTS SQL
**System**: “You write safe Postgres SQL. Use `generated always` tsvector columns and GIN indexes.”  
**Ask**: “Create migrations from Task T-2.2 and T-2.3 with reversible statements and comments.”

### P-3: React Native hooks
**System**: “You write idiomatic React hooks using TanStack Query with optimistic updates and offline persistence.”  
**Ask**: “Implement hooks listed in Tasks T-6.x. Include typing from `Database` and invalidation keys.”

### P-4: Moderation
**System**: “You design admin-safe endpoints and UIs for UGC moderation.”  
**Ask**: “Build `report_action` function and the admin queue screen per T-4.5 and T-6.9.”

### P-5: Deep Linking + Push
**System**: “You integrate Expo Linking and Notifications. Push payloads must include `data.url` which opens the correct screen.”  
**Ask**: “Complete tasks T-5.2 and T-5.3; include iOS/Android config snippets in `app.config.ts`.”

---

## 10) Acceptance Checklist (global)

- [ ] All migrations applied; seeds load; RLS enabled on every table.
- [ ] Scheduled jobs visible in Supabase Dashboard; logs show periodic runs.
- [ ] Push: register, send (T-4.2), receipts prune (T-4.3); no crashes if token missing.
- [ ] Deep links open correct screens from terminated/background/foreground states.
- [ ] Moderation flows: report/block; admin can action/dismiss; audit written.
- [ ] Offline: Lists available after relaunch; refetch on focus.
- [ ] Auth: guest flows work; upgrade path keeps data; admin-only actions blocked for non-admins.
- [ ] Search returns ranked results; pagination OK.
- [ ] Storage: signed URL access works; cross-org blocked.

---

## 11) File Map Recap (what Codex will touch)

- **Migrations**: `030_storage_policies.sql`, `040_search_fts.sql`, `050_rls_policies.sql`
- **Seeds**: `seed/demo-org-and-users.sql`
- **Functions**: `save_device_token`, `event_reminder_30m`, `push_receipts`, `notification_prefs_upsert`, `report_action`, `impersonate`, `search`
- **Mobile**:
  - `src/lib/supabase.ts`, `src/types/database.types.ts`
  - `src/lib/queryClient.ts`
  - `src/constants/links.ts`
  - `src/features/**` (announcements, devotional, events, prayer, moderation, preferences, search, notifications)
  - `app/(modals)/report.tsx`, `app/admin/reports.tsx`, `app/admin/impersonate.tsx`, `app/settings.tsx`

---

## 12) References (for Codex context)

- Supabase Cron & Scheduled Functions (minute/sub-minute), Edge Function scheduling.  
- Expo Push: sending + receipts (DeviceNotRegistered).  
- Expo Linking (scheme + Universal/App Links).  
- TanStack Query persistence (AsyncStorage).  
- FlashList usage patterns.

*(See project docs folder for detailed links.)*

---

### Execution Order Summary

1) T-1 prerequisites → 2) T-2 DB & seeds → 3) T-3 cron → 4) T-4 functions → 5) T-5 infra → 6) T-6 features → 7) T-7 auth → 8) T-8 tests → Acceptance Checklist.

---

**End.**
