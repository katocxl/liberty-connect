# LibertyConnect — Codex File-by-File Checklist

> Use this as a **single source of truth** for what to implement and validate in each file.  
> Skip the plain-text files under `Instrctions/` (spelling as in repo) as requested.

**Global expectations**  
- TypeScript strict mode on; no `any` unless justified.  
- All network calls typed with `Database` types from Supabase.  
- Every feature guarded by `org_id` and RLS-compatible queries.  
- Edge Functions are idempotent, return JSON, and never expose service role to clients.  
- Push payloads include `data.url` deep links.  
- Offline-ready: lists cached, app refetches on focus.  
- Accessibility: 44px touch targets; role & label on tappables.  
- Errors are surfaced with friendly UI and structured logs server-side.

**References used to derive these checks**  
- Expo Push: sending + receipts (handle `DeviceNotRegistered`).  
- Expo Linking: custom scheme + Universal/App Links.  
- Expo Router protected routes (auth gating).  
- Supabase Edge Functions (Deno) + scheduling with Cron/pg_net.  
- Supabase Storage Access Control with RLS.  
- Supabase Anonymous Sign-ins (`is_anonymous`).  
- Supabase TypeScript types generation.  

(See links in the chat message for citations.)

---


### `README.md`

**Purpose**: Project overview and quickstart for contributors and Codex.
**Checklist:**
- [ ] Includes stack, prerequisites, and 'Getting Started' commands
- [ ] Links to docs: logic_flow.md, deep-linking, auth, storage-rls
- [ ] Describes env vars required in `mobile/.env` and `mobile/.env.production`
- [ ] Mentions how to run Supabase + apply migrations + seed data
**Definition of Done:**
- [ ] New contributor can run local app and see seeded content
- [ ] Dead links: none; all docs referenced exist

### `.gitignore`

**Purpose**: Ignore build artifacts, env files, and platform-specific junk.
**Checklist:**
- [ ] Ignore `/mobile/.env*`, `node_modules/`, `.expo/` cache, `dist/`, `build/`
- [ ] Ignore `supabase/.temp/`, `supabase/.branches/` where appropriate
**Definition of Done:**
- [ ] Git status shows no generated artifacts or secrets

### `package.json`

**Purpose**: Workspace root scripts and tooling.
**Checklist:**
- [ ] Scripts for `lint`, `format`, and possibly workspaces if used
- [ ] Ensure no duplicate devDeps with /mobile
**Definition of Done:**
- [ ] `npm run lint` and `format` complete without errors

### `tsconfig.json`

**Purpose**: Base TS config inherited by packages.
**Checklist:**
- [ ] `strict: true` and appropriate `paths`/`baseUrl` if using aliases
**Definition of Done:**
- [ ] Type-check passes at root

### `eas.json`

**Purpose**: Expo Application Services configuration.
**Checklist:**
- [ ] Profiles for `development`, `preview`, `production` defined
- [ ] Runtime version strategy documented
**Definition of Done:**
- [ ] EAS CLI validates file

### `eslint.config.js`

**Purpose**: Lint rules shared across repo.
**Checklist:**
- [ ] Extends RN recommended + TypeScript
- [ ] Prettier compatibility set
**Definition of Done:**
- [ ] `npm run lint` passes in root and `mobile/`

### `file-tree.txt`

**Purpose**: Generated file map for quick auditing.
**Checklist:**
- [ ] Matches actual repo contents
**Definition of Done:**
- [ ] CI (or script) can diff this against `git ls-files`

### `.expo/devices.json`

**Purpose**: Expo local device registry (dev-only).
**Checklist:**
- [ ] No secrets; JSON valid; dev-only context
**Definition of Done:**
- [ ] Expo CLI reads without warning

### `.expo/README.md`

**Purpose**: Notes about Expo dev setup.
**Checklist:**
- [ ] Explains what devices.json is and how to clear it
**Definition of Done:**
- [ ] New dev can follow steps without confusion


### `supabase/functions/_shared/auth.ts`

**Purpose**: Helpers for validating admin/mod roles from JWT and DB.
**Checklist:**
- [ ] Exports `requireAdmin`/`requireRole` utilities
- [ ] Throws/returns 403 JSON if caller lacks role
- [ ] Does not import service role on client paths
**Definition of Done:**
- [ ] Edge Functions import and use these utilities

### `supabase/functions/_shared/http.ts`

**Purpose**: HTTP helpers for Edge Functions.
**Checklist:**
- [ ] Exports `json`, `error`, `parseJsonBody`, CORS handler
- [ ] Consistent error envelope with `requestId` and timestamp
**Definition of Done:**
- [ ] All functions return consistent JSON (checked manually)

### `supabase/functions/_shared/push.ts`

**Purpose**: Expo push helpers (send, chunking, receipts).
**Checklist:**
- [ ] `sendExpoMessages(messages[])` that chunks requests
- [ ] `fetchReceipts(ticketIds[])` and maps to tokens
- [ ] Constants for `DeviceNotRegistered` handling
**Definition of Done:**
- [ ] Event reminder and receipts functions import these

### `supabase/functions/_shared/supabase.ts`

**Purpose**: Factory for admin and anon clients inside Edge Functions.
**Checklist:**
- [ ] Reads `SUPABASE_URL`, `SERVICE_ROLE_KEY` from env
- [ ] Exports `getAdminClient()` and `getClientFromRequest(req)`
**Definition of Done:**
- [ ] Functions can perform RLS-bypassing writes only via admin client

### `supabase/functions/_shared/mod.ts`

**Purpose**: Barrel export for shared helpers.
**Checklist:**
- [ ] Re-exports { auth, http, push, supabase }
**Definition of Done:**
- [ ] Consumers import from a single path without circular deps

### `supabase/functions/announcement_create/index.ts`

**Purpose**: Edge Function: `announcement_create`
**Checklist:**
- [ ] Imports only from `_shared/*` and standard libs
- [ ] Validates input schema; returns 400 on invalid
- [ ] All DB operations scoped by `org_id` where relevant
- [ ] Idempotent writes (use `upsert`/conflict targets where appropriate)
- [ ] Logs structured messages (info/error) with requestId
**Definition of Done:**
- [ ] Manual call returns JSON and does not throw
- [ ] Unauthorised callers receive 401/403 with JSON body

### `supabase/functions/api/index.ts`

**Purpose**: Edge Function: `api`
**Checklist:**
- [ ] Imports only from `_shared/*` and standard libs
- [ ] Validates input schema; returns 400 on invalid
- [ ] All DB operations scoped by `org_id` where relevant
- [ ] Idempotent writes (use `upsert`/conflict targets where appropriate)
- [ ] Logs structured messages (info/error) with requestId
**Definition of Done:**
- [ ] Manual call returns JSON and does not throw
- [ ] Unauthorised callers receive 401/403 with JSON body

### `supabase/functions/devotional_upsert/index.ts`

**Purpose**: Edge Function: `devotional_upsert`
**Checklist:**
- [ ] Imports only from `_shared/*` and standard libs
- [ ] Validates input schema; returns 400 on invalid
- [ ] All DB operations scoped by `org_id` where relevant
- [ ] Idempotent writes (use `upsert`/conflict targets where appropriate)
- [ ] Logs structured messages (info/error) with requestId
**Definition of Done:**
- [ ] Manual call returns JSON and does not throw
- [ ] Unauthorised callers receive 401/403 with JSON body

### `supabase/functions/event_create/index.ts`

**Purpose**: Edge Function: `event_create`
**Checklist:**
- [ ] Imports only from `_shared/*` and standard libs
- [ ] Validates input schema; returns 400 on invalid
- [ ] All DB operations scoped by `org_id` where relevant
- [ ] Idempotent writes (use `upsert`/conflict targets where appropriate)
- [ ] Logs structured messages (info/error) with requestId
**Definition of Done:**
- [ ] Manual call returns JSON and does not throw
- [ ] Unauthorised callers receive 401/403 with JSON body

### `supabase/functions/event_reminder_30m/index.ts`

**Purpose**: Edge Function: `event_reminder_30m`
**Checklist:**
- [ ] Imports only from `_shared/*` and standard libs
- [ ] Validates input schema; returns 400 on invalid
- [ ] All DB operations scoped by `org_id` where relevant
- [ ] Idempotent writes (use `upsert`/conflict targets where appropriate)
- [ ] Logs structured messages (info/error) with requestId
**Definition of Done:**
- [ ] Manual call returns JSON and does not throw
- [ ] Unauthorised callers receive 401/403 with JSON body

### `supabase/functions/event_rsvp/index.ts`

**Purpose**: Edge Function: `event_rsvp`
**Checklist:**
- [ ] Imports only from `_shared/*` and standard libs
- [ ] Validates input schema; returns 400 on invalid
- [ ] All DB operations scoped by `org_id` where relevant
- [ ] Idempotent writes (use `upsert`/conflict targets where appropriate)
- [ ] Logs structured messages (info/error) with requestId
**Definition of Done:**
- [ ] Manual call returns JSON and does not throw
- [ ] Unauthorised callers receive 401/403 with JSON body

### `supabase/functions/maintenance-ttl/index.ts`

**Purpose**: Edge Function: `maintenance-ttl`
**Checklist:**
- [ ] Imports only from `_shared/*` and standard libs
- [ ] Validates input schema; returns 400 on invalid
- [ ] All DB operations scoped by `org_id` where relevant
- [ ] Idempotent writes (use `upsert`/conflict targets where appropriate)
- [ ] Logs structured messages (info/error) with requestId
**Definition of Done:**
- [ ] Manual call returns JSON and does not throw
- [ ] Unauthorised callers receive 401/403 with JSON body

### `supabase/functions/prayer_create/index.ts`

**Purpose**: Edge Function: `prayer_create`
**Checklist:**
- [ ] Imports only from `_shared/*` and standard libs
- [ ] Validates input schema; returns 400 on invalid
- [ ] All DB operations scoped by `org_id` where relevant
- [ ] Idempotent writes (use `upsert`/conflict targets where appropriate)
- [ ] Logs structured messages (info/error) with requestId
**Definition of Done:**
- [ ] Manual call returns JSON and does not throw
- [ ] Unauthorised callers receive 401/403 with JSON body

### `supabase/functions/prayer_react/index.ts`

**Purpose**: Edge Function: `prayer_react`
**Checklist:**
- [ ] Imports only from `_shared/*` and standard libs
- [ ] Validates input schema; returns 400 on invalid
- [ ] All DB operations scoped by `org_id` where relevant
- [ ] Idempotent writes (use `upsert`/conflict targets where appropriate)
- [ ] Logs structured messages (info/error) with requestId
**Definition of Done:**
- [ ] Manual call returns JSON and does not throw
- [ ] Unauthorised callers receive 401/403 with JSON body

### `supabase/functions/save_device_token/index.ts`

**Purpose**: Edge Function: `save_device_token`
**Checklist:**
- [ ] Imports only from `_shared/*` and standard libs
- [ ] Validates input schema; returns 400 on invalid
- [ ] All DB operations scoped by `org_id` where relevant
- [ ] Idempotent writes (use `upsert`/conflict targets where appropriate)
- [ ] Logs structured messages (info/error) with requestId
**Definition of Done:**
- [ ] Manual call returns JSON and does not throw
- [ ] Unauthorised callers receive 401/403 with JSON body

### `supabase/migrations/000_init.sql`

**Purpose**: Initial schema and extensions.
**Checklist:**
- [ ] Creates core tables and enables required extensions (`pgcrypto`, etc.)
- [ ] Enables RLS and default deny policies
**Definition of Done:**
- [ ] Fresh database boots; RLS on core tables confirmed

### `supabase/migrations/010_cron_ttls.sql`

**Purpose**: Schedules TTL sweeps and report summary jobs.
**Checklist:**
- [ ] Defines cron jobs using `pg_cron`/`supabase cron` syntax
- [ ] Comments include frequency and function names
**Definition of Done:**
- [ ] Cron entries appear in Dashboard and run without error

### `supabase/migrations/020_cron_reminders.sql`

**Purpose**: Schedules `event_reminder_30m` every minute with a safe window.
**Checklist:**
- [ ] Uses a 29–31 min window in SQL to handle clock drift
- [ ] Job secured; only calls the public Edge Function endpoint via pg_net
**Definition of Done:**
- [ ] Reminder function receives invocations on schedule

### `supabase/seed/visible-content.sql`

**Purpose**: Seed data for one demo org and content/events.
**Checklist:**
- [ ] Inserts org, users, announcements, devotionals, prayers, events, RSVPs
- [ ] No hard-coded secrets or emails outside local dev
**Definition of Done:**
- [ ] After seed, app screens show content without auth

### `mobile/app.config.ts`

**Purpose**: Expo app configuration including deep linking.
**Checklist:**
- [ ] Defines `scheme`, iOS Universal Links, Android App Links
- [ ] Sets extra env (Supabase URL/keys via `expo-constants`)
- [ ] Configures notifications entitlement for iOS/Android
**Definition of Done:**
- [ ] Deep links resolve to screens; EAS config validates

### `mobile/babel.config.js`

**Purpose**: Babel config for Expo + TS paths.
**Checklist:**
- [ ] Module resolver alias matches TS paths
- [ ] Plugins compatible with Expo SDK
**Definition of Done:**
- [ ] Metro builds without warnings

### `mobile/expo-env.d.ts`

**Purpose**: Ambient types for Expo env variables.
**Checklist:**
- [ ] Declares `process.env`/`expo-constants` types used in app
**Definition of Done:**
- [ ] Type-check passes; no implicit any on env

### `mobile/global.css`

**Purpose**: Global styles (if using NativeWind/StyleSheet).
**Checklist:**
- [ ] Resets and theme tokens consistent with Tailwind config
**Definition of Done:**
- [ ] No unused classes; app renders correctly

### `mobile/index.js`

**Purpose**: Entrypoint for Expo app (registerRootComponent).
**Checklist:**
- [ ] Exports the root component and providers
- [ ] No side effects except app bootstrap
**Definition of Done:**
- [ ] App launches in Expo Go and builds in EAS

### `mobile/metro.config.js`

**Purpose**: Metro bundler config for monorepo/aliases.
**Checklist:**
- [ ] Ensures asset plugins configured for fonts/images
**Definition of Done:**
- [ ] Assets (fonts/images) load correctly on device

### `mobile/nativewind-env.d.ts`

**Purpose**: Types for NativeWind (if used).
**Checklist:**
- [ ] Ambient declarations compile
**Definition of Done:**
- [ ] No TS errors in styles usage

### `mobile/package.json`

**Purpose**: App package with dependencies and scripts.
**Checklist:**
- [ ] Includes expo, react-native, expo-router, expo-notifications, @tanstack/react-query, @shopify/flash-list, supabase-js
- [ ] Scripts: `start`, `android`, `ios`, `test`, `lint`
**Definition of Done:**
- [ ] `npm run start` works; dependency versions compatible

### `mobile/tailwind.config.js`

**Purpose**: Tailwind/NativeWind theme.
**Checklist:**
- [ ] Defines color palette, fonts to match assets
**Definition of Done:**
- [ ] Classes compile; no unknown class warnings

### `mobile/tsconfig.json`

**Purpose**: TS config for app.
**Checklist:**
- [ ] `jsx: react-jsx`, paths for `src/*` aliases
- [ ] `strict: true` and RN JSX types enabled
**Definition of Done:**
- [ ] Type-check passes for the app

### `mobile/.env`

**Purpose**: Dev environment variables (local).
**Checklist:**
- [ ] Contains Supabase URL and anon key (dev only)
- [ ] No service role key present
**Definition of Done:**
- [ ] App runs locally; no crashes on missing env

### `mobile/.env.production`

**Purpose**: Prod environment variables (build-time).
**Checklist:**
- [ ] Supabase URL and anon key for prod
- [ ] No service role key; secure storage configured if needed
**Definition of Done:**
- [ ] Release build uses prod endpoints

### `mobile/.gitignore`

**Purpose**: Ignore app-specific caches and artifacts.
**Checklist:**
- [ ] Ignore `android/`, `ios/` if not ejecting; `.expo/` caches; `*.keystore`
**Definition of Done:**
- [ ] `git status` is clean after build

### `mobile/.expo/README.md`

**Purpose**: Explain Expo workspace folder.
**Checklist:**
- [ ] Clarify dev-only expectations
**Definition of Done:**
- [ ] New devs understand not to commit secrets here

### `mobile/.expo/devices.json`

**Purpose**: Local device registry for the app workspace.
**Checklist:**
- [ ] JSON valid; contains no secrets
**Definition of Done:**
- [ ] Expo CLI uses it without warnings

### `mobile/.expo/types/router.d.ts`

**Purpose**: Router types augmentation.
**Checklist:**
- [ ] Ensures route params types for `[id]` screens
**Definition of Done:**
- [ ] Navigation hooks infer correct types

### `mobile/.vscode/extensions.json`

**Purpose**: Recommended extensions for the workspace.
**Checklist:**
- [ ] Include ESLint, Prettier, Tailwind IntelliSense, Supabase
**Definition of Done:**
- [ ] VS Code suggests recommended extensions

### `mobile/.vscode/settings.json`

**Purpose**: Editor settings that match project style.
**Checklist:**
- [ ] Format on save, TypeScript SDK selection, Prettier config
**Definition of Done:**
- [ ] No formatting diffs across contributors

### `mobile/app/_layout.tsx`

**Purpose**: Expo Router screen or layout.
**Checklist:**
- [ ] Uses typed navigation params
- [ ] Screen subscribes to updates via TanStack Query + Realtime if needed
- [ ] Handles loading/error/empty states
- [ ] Actions gated behind auth (protected routes where required)
- [ ] Links built with helpers in `src/constants/links.ts`
**Definition of Done:**
- [ ] Navigating via deep link lands here correctly
- [ ] Back navigation and pull-to-refresh work without crashes

### `mobile/app/+not-found.tsx`

**Purpose**: Expo Router screen or layout.
**Checklist:**
- [ ] Uses typed navigation params
- [ ] Screen subscribes to updates via TanStack Query + Realtime if needed
- [ ] Handles loading/error/empty states
- [ ] Actions gated behind auth (protected routes where required)
- [ ] Links built with helpers in `src/constants/links.ts`
**Definition of Done:**
- [ ] Navigating via deep link lands here correctly
- [ ] Back navigation and pull-to-refresh work without crashes

### `mobile/app/(auth)/_layout.tsx`

**Purpose**: Expo Router screen or layout.
**Checklist:**
- [ ] Uses typed navigation params
- [ ] Screen subscribes to updates via TanStack Query + Realtime if needed
- [ ] Handles loading/error/empty states
- [ ] Actions gated behind auth (protected routes where required)
- [ ] Links built with helpers in `src/constants/links.ts`
**Definition of Done:**
- [ ] Navigating via deep link lands here correctly
- [ ] Back navigation and pull-to-refresh work without crashes

### `mobile/app/(auth)/register.tsx`

**Purpose**: Expo Router screen or layout.
**Checklist:**
- [ ] Uses typed navigation params
- [ ] Screen subscribes to updates via TanStack Query + Realtime if needed
- [ ] Handles loading/error/empty states
- [ ] Actions gated behind auth (protected routes where required)
- [ ] Links built with helpers in `src/constants/links.ts`
**Definition of Done:**
- [ ] Navigating via deep link lands here correctly
- [ ] Back navigation and pull-to-refresh work without crashes

### `mobile/app/(auth)/sign-in.tsx`

**Purpose**: Expo Router screen or layout.
**Checklist:**
- [ ] Uses typed navigation params
- [ ] Screen subscribes to updates via TanStack Query + Realtime if needed
- [ ] Handles loading/error/empty states
- [ ] Actions gated behind auth (protected routes where required)
- [ ] Links built with helpers in `src/constants/links.ts`
**Definition of Done:**
- [ ] Navigating via deep link lands here correctly
- [ ] Back navigation and pull-to-refresh work without crashes

### `mobile/app/(future)/_layout.tsx`

**Purpose**: Expo Router screen or layout.
**Checklist:**
- [ ] Uses typed navigation params
- [ ] Screen subscribes to updates via TanStack Query + Realtime if needed
- [ ] Handles loading/error/empty states
- [ ] Actions gated behind auth (protected routes where required)
- [ ] Links built with helpers in `src/constants/links.ts`
**Definition of Done:**
- [ ] Navigating via deep link lands here correctly
- [ ] Back navigation and pull-to-refresh work without crashes

### `mobile/app/(future)/dashboard.tsx`

**Purpose**: Expo Router screen or layout.
**Checklist:**
- [ ] Uses typed navigation params
- [ ] Screen subscribes to updates via TanStack Query + Realtime if needed
- [ ] Handles loading/error/empty states
- [ ] Actions gated behind auth (protected routes where required)
- [ ] Links built with helpers in `src/constants/links.ts`
**Definition of Done:**
- [ ] Navigating via deep link lands here correctly
- [ ] Back navigation and pull-to-refresh work without crashes

### `mobile/app/(future)/groups.tsx`

**Purpose**: Expo Router screen or layout.
**Checklist:**
- [ ] Uses typed navigation params
- [ ] Screen subscribes to updates via TanStack Query + Realtime if needed
- [ ] Handles loading/error/empty states
- [ ] Actions gated behind auth (protected routes where required)
- [ ] Links built with helpers in `src/constants/links.ts`
**Definition of Done:**
- [ ] Navigating via deep link lands here correctly
- [ ] Back navigation and pull-to-refresh work without crashes

### `mobile/app/(modals)/_layout.tsx`

**Purpose**: Expo Router screen or layout.
**Checklist:**
- [ ] Uses typed navigation params
- [ ] Screen subscribes to updates via TanStack Query + Realtime if needed
- [ ] Handles loading/error/empty states
- [ ] Actions gated behind auth (protected routes where required)
- [ ] Links built with helpers in `src/constants/links.ts`
**Definition of Done:**
- [ ] Navigating via deep link lands here correctly
- [ ] Back navigation and pull-to-refresh work without crashes

### `mobile/app/(modals)/admin-announcement.tsx`

**Purpose**: Expo Router screen or layout.
**Checklist:**
- [ ] Uses typed navigation params
- [ ] Screen subscribes to updates via TanStack Query + Realtime if needed
- [ ] Handles loading/error/empty states
- [ ] Actions gated behind auth (protected routes where required)
- [ ] Links built with helpers in `src/constants/links.ts`
**Definition of Done:**
- [ ] Navigating via deep link lands here correctly
- [ ] Back navigation and pull-to-refresh work without crashes

### `mobile/app/(modals)/admin-devotional.tsx`

**Purpose**: Expo Router screen or layout.
**Checklist:**
- [ ] Uses typed navigation params
- [ ] Screen subscribes to updates via TanStack Query + Realtime if needed
- [ ] Handles loading/error/empty states
- [ ] Actions gated behind auth (protected routes where required)
- [ ] Links built with helpers in `src/constants/links.ts`
**Definition of Done:**
- [ ] Navigating via deep link lands here correctly
- [ ] Back navigation and pull-to-refresh work without crashes

### `mobile/app/(modals)/admin-event.tsx`

**Purpose**: Expo Router screen or layout.
**Checklist:**
- [ ] Uses typed navigation params
- [ ] Screen subscribes to updates via TanStack Query + Realtime if needed
- [ ] Handles loading/error/empty states
- [ ] Actions gated behind auth (protected routes where required)
- [ ] Links built with helpers in `src/constants/links.ts`
**Definition of Done:**
- [ ] Navigating via deep link lands here correctly
- [ ] Back navigation and pull-to-refresh work without crashes

### `mobile/app/(tabs)/_layout.tsx`

**Purpose**: Expo Router screen or layout.
**Checklist:**
- [ ] Uses typed navigation params
- [ ] Screen subscribes to updates via TanStack Query + Realtime if needed
- [ ] Handles loading/error/empty states
- [ ] Actions gated behind auth (protected routes where required)
- [ ] Links built with helpers in `src/constants/links.ts`
**Definition of Done:**
- [ ] Navigating via deep link lands here correctly
- [ ] Back navigation and pull-to-refresh work without crashes

### `mobile/app/(tabs)/events.tsx`

**Purpose**: Expo Router screen or layout.
**Checklist:**
- [ ] Uses typed navigation params
- [ ] Screen subscribes to updates via TanStack Query + Realtime if needed
- [ ] Handles loading/error/empty states
- [ ] Actions gated behind auth (protected routes where required)
- [ ] Links built with helpers in `src/constants/links.ts`
**Definition of Done:**
- [ ] Navigating via deep link lands here correctly
- [ ] Back navigation and pull-to-refresh work without crashes

### `mobile/app/(tabs)/index.tsx`

**Purpose**: Expo Router screen or layout.
**Checklist:**
- [ ] Uses typed navigation params
- [ ] Screen subscribes to updates via TanStack Query + Realtime if needed
- [ ] Handles loading/error/empty states
- [ ] Actions gated behind auth (protected routes where required)
- [ ] Links built with helpers in `src/constants/links.ts`
**Definition of Done:**
- [ ] Navigating via deep link lands here correctly
- [ ] Back navigation and pull-to-refresh work without crashes

### `mobile/app/(tabs)/prayer.tsx`

**Purpose**: Expo Router screen or layout.
**Checklist:**
- [ ] Uses typed navigation params
- [ ] Screen subscribes to updates via TanStack Query + Realtime if needed
- [ ] Handles loading/error/empty states
- [ ] Actions gated behind auth (protected routes where required)
- [ ] Links built with helpers in `src/constants/links.ts`
**Definition of Done:**
- [ ] Navigating via deep link lands here correctly
- [ ] Back navigation and pull-to-refresh work without crashes

### `mobile/app/event/[id].tsx`

**Purpose**: Expo Router screen or layout.
**Checklist:**
- [ ] Uses typed navigation params
- [ ] Screen subscribes to updates via TanStack Query + Realtime if needed
- [ ] Handles loading/error/empty states
- [ ] Actions gated behind auth (protected routes where required)
- [ ] Links built with helpers in `src/constants/links.ts`
**Definition of Done:**
- [ ] Navigating via deep link lands here correctly
- [ ] Back navigation and pull-to-refresh work without crashes

### `mobile/app/prayer/[id].tsx`

**Purpose**: Expo Router screen or layout.
**Checklist:**
- [ ] Uses typed navigation params
- [ ] Screen subscribes to updates via TanStack Query + Realtime if needed
- [ ] Handles loading/error/empty states
- [ ] Actions gated behind auth (protected routes where required)
- [ ] Links built with helpers in `src/constants/links.ts`
**Definition of Done:**
- [ ] Navigating via deep link lands here correctly
- [ ] Back navigation and pull-to-refresh work without crashes

### `mobile/src/assets/fonts/CrimsonPro-*.ttf`

**Purpose**: Font assets.
**Checklist:**
- [ ] Preloaded via `expo-font`; listed in `app.config.ts` if needed for iOS
**Definition of Done:**
- [ ] Text renders with the chosen fonts on both platforms

### `mobile/src/assets/README.md`

**Purpose**: Explain how to add fonts/images.
**Checklist:**
- [ ] Document `require` pattern and caching
**Definition of Done:**
- [ ] Contributors can add assets without breaking build

### `mobile/src/constants/env.ts`

**Purpose**: Constants used across features.
**Checklist:**
- [ ] No secrets; types exported; unit-friendly
**Definition of Done:**
- [ ] Importing modules has no side effects

### `mobile/src/constants/routes.ts`

**Purpose**: Constants used across features.
**Checklist:**
- [ ] No secrets; types exported; unit-friendly
**Definition of Done:**
- [ ] Importing modules has no side effects

### `mobile/src/constants/tokens.ts`

**Purpose**: Constants used across features.
**Checklist:**
- [ ] No secrets; types exported; unit-friendly
**Definition of Done:**
- [ ] Importing modules has no side effects

### `mobile/src/constants/ttl.ts`

**Purpose**: Constants used across features.
**Checklist:**
- [ ] No secrets; types exported; unit-friendly
**Definition of Done:**
- [ ] Importing modules has no side effects

### `mobile/src/constants/links.ts`

**Purpose**: Helpers to build deep links and web fallbacks.
**Checklist:**
- [ ] Exports `toEvent(id)`, `toPrayer(id)`, `toAnnouncement(id)` returning scheme URLs and web URLs
- [ ] Used by push payload builder and navigation
**Definition of Done:**
- [ ] Generated URLs match Router paths and open correctly

### `mobile/src/features/announcements/components/AnnouncementCard.tsx`

**Purpose**: Announcements UI component.
**Checklist:**
- [ ] Pure component; props typed; memoized where needed
- [ ] Supports loading/empty/error visuals via props
- [ ] A11y labels on interactive elements
**Definition of Done:**
- [ ] Renders in Storybook (if present) or sample screen without warnings

### `mobile/src/features/announcements/components/AnnouncementList.tsx`

**Purpose**: Announcements UI component.
**Checklist:**
- [ ] Pure component; props typed; memoized where needed
- [ ] Supports loading/empty/error visuals via props
- [ ] A11y labels on interactive elements
**Definition of Done:**
- [ ] Renders in Storybook (if present) or sample screen without warnings

### `mobile/src/features/announcements/hooks/useAnnouncements.ts`

**Purpose**: Data hook for announcements.
**Checklist:**
- [ ] Uses TanStack Query with stable keys and cache times
- [ ] Optimistic updates where relevant; invalidates on success
- [ ] Cancels in-flight queries on unmount if appropriate
**Definition of Done:**
- [ ] Hook returns typed data; suspense/loader works

### `mobile/src/features/announcements/api.ts`

**Purpose**: API layer for announcements feature.
**Checklist:**
- [ ] Wraps Supabase calls; always filters by `org_id`
- [ ] No service role; client-side only anon/anon+user
**Definition of Done:**
- [ ] Network errors mapped to typed error objects

### `mobile/src/features/announcements/types.ts`

**Purpose**: Types for announcements feature.
**Checklist:**
- [ ] Exports TypeScript types/interfaces only; no runtime
**Definition of Done:**
- [ ] Imports cause no side effects; builds fast

### `mobile/src/features/devotional/components/DevotionalCard.tsx`

**Purpose**: Devotional UI component.
**Checklist:**
- [ ] Pure component; props typed; memoized where needed
- [ ] Supports loading/empty/error visuals via props
- [ ] A11y labels on interactive elements
**Definition of Done:**
- [ ] Renders in Storybook (if present) or sample screen without warnings

### `mobile/src/features/devotional/hooks/useDevotional.ts`

**Purpose**: Data hook for devotional.
**Checklist:**
- [ ] Uses TanStack Query with stable keys and cache times
- [ ] Optimistic updates where relevant; invalidates on success
- [ ] Cancels in-flight queries on unmount if appropriate
**Definition of Done:**
- [ ] Hook returns typed data; suspense/loader works

### `mobile/src/features/devotional/api.ts`

**Purpose**: API layer for devotional feature.
**Checklist:**
- [ ] Wraps Supabase calls; always filters by `org_id`
- [ ] No service role; client-side only anon/anon+user
**Definition of Done:**
- [ ] Network errors mapped to typed error objects

### `mobile/src/features/devotional/types.ts`

**Purpose**: Types for devotional feature.
**Checklist:**
- [ ] Exports TypeScript types/interfaces only; no runtime
**Definition of Done:**
- [ ] Imports cause no side effects; builds fast

### `mobile/src/features/events/components/EventDetails.tsx`

**Purpose**: Events UI component.
**Checklist:**
- [ ] Pure component; props typed; memoized where needed
- [ ] Supports loading/empty/error visuals via props
- [ ] A11y labels on interactive elements
**Definition of Done:**
- [ ] Renders in Storybook (if present) or sample screen without warnings

### `mobile/src/features/events/components/EventList.tsx`

**Purpose**: Events UI component.
**Checklist:**
- [ ] Pure component; props typed; memoized where needed
- [ ] Supports loading/empty/error visuals via props
- [ ] A11y labels on interactive elements
**Definition of Done:**
- [ ] Renders in Storybook (if present) or sample screen without warnings

### `mobile/src/features/events/components/RSVPButton.tsx`

**Purpose**: Events UI component.
**Checklist:**
- [ ] Pure component; props typed; memoized where needed
- [ ] Supports loading/empty/error visuals via props
- [ ] A11y labels on interactive elements
**Definition of Done:**
- [ ] Renders in Storybook (if present) or sample screen without warnings

### `mobile/src/features/events/hooks/useEvent.ts`

**Purpose**: Data hook for events.
**Checklist:**
- [ ] Uses TanStack Query with stable keys and cache times
- [ ] Optimistic updates where relevant; invalidates on success
- [ ] Cancels in-flight queries on unmount if appropriate
**Definition of Done:**
- [ ] Hook returns typed data; suspense/loader works

### `mobile/src/features/events/hooks/useEvents.ts`

**Purpose**: Data hook for events.
**Checklist:**
- [ ] Uses TanStack Query with stable keys and cache times
- [ ] Optimistic updates where relevant; invalidates on success
- [ ] Cancels in-flight queries on unmount if appropriate
**Definition of Done:**
- [ ] Hook returns typed data; suspense/loader works

### `mobile/src/features/events/hooks/useRSVP.ts`

**Purpose**: Data hook for events.
**Checklist:**
- [ ] Uses TanStack Query with stable keys and cache times
- [ ] Optimistic updates where relevant; invalidates on success
- [ ] Cancels in-flight queries on unmount if appropriate
**Definition of Done:**
- [ ] Hook returns typed data; suspense/loader works

### `mobile/src/features/events/api.ts`

**Purpose**: API layer for events feature.
**Checklist:**
- [ ] Wraps Supabase calls; always filters by `org_id`
- [ ] No service role; client-side only anon/anon+user
**Definition of Done:**
- [ ] Network errors mapped to typed error objects

### `mobile/src/features/events/types.ts`

**Purpose**: Types for events feature.
**Checklist:**
- [ ] Exports TypeScript types/interfaces only; no runtime
**Definition of Done:**
- [ ] Imports cause no side effects; builds fast

### `mobile/src/features/home/components/HomeScreen.tsx`

**Purpose**: Home UI component.
**Checklist:**
- [ ] Pure component; props typed; memoized where needed
- [ ] Supports loading/empty/error visuals via props
- [ ] A11y labels on interactive elements
**Definition of Done:**
- [ ] Renders in Storybook (if present) or sample screen without warnings

### `mobile/src/features/home/hooks/useHomeSnapshot.ts`

**Purpose**: Data hook for home.
**Checklist:**
- [ ] Uses TanStack Query with stable keys and cache times
- [ ] Optimistic updates where relevant; invalidates on success
- [ ] Cancels in-flight queries on unmount if appropriate
**Definition of Done:**
- [ ] Hook returns typed data; suspense/loader works

### `mobile/src/features/notifications/deeplinks.ts`

**Purpose**: API layer for notifications feature.
**Checklist:**
- [ ] Wraps Supabase calls; always filters by `org_id`
- [ ] No service role; client-side only anon/anon+user
**Definition of Done:**
- [ ] Network errors mapped to typed error objects

### `mobile/src/features/notifications/handleNotificationTap.ts`

**Purpose**: API layer for notifications feature.
**Checklist:**
- [ ] Wraps Supabase calls; always filters by `org_id`
- [ ] No service role; client-side only anon/anon+user
**Definition of Done:**
- [ ] Network errors mapped to typed error objects

### `mobile/src/features/notifications/registerPush.ts`

**Purpose**: API layer for notifications feature.
**Checklist:**
- [ ] Wraps Supabase calls; always filters by `org_id`
- [ ] No service role; client-side only anon/anon+user
**Definition of Done:**
- [ ] Network errors mapped to typed error objects

### `mobile/src/features/prayer/components/ComposePrayerSheet.tsx`

**Purpose**: Prayer UI component.
**Checklist:**
- [ ] Pure component; props typed; memoized where needed
- [ ] Supports loading/empty/error visuals via props
- [ ] A11y labels on interactive elements
**Definition of Done:**
- [ ] Renders in Storybook (if present) or sample screen without warnings

### `mobile/src/features/prayer/components/PrayerCard.tsx`

**Purpose**: Prayer UI component.
**Checklist:**
- [ ] Pure component; props typed; memoized where needed
- [ ] Supports loading/empty/error visuals via props
- [ ] A11y labels on interactive elements
**Definition of Done:**
- [ ] Renders in Storybook (if present) or sample screen without warnings

### `mobile/src/features/prayer/hooks/useComposePrayer.ts`

**Purpose**: Data hook for prayer.
**Checklist:**
- [ ] Uses TanStack Query with stable keys and cache times
- [ ] Optimistic updates where relevant; invalidates on success
- [ ] Cancels in-flight queries on unmount if appropriate
**Definition of Done:**
- [ ] Hook returns typed data; suspense/loader works

### `mobile/src/features/prayer/hooks/usePrayer.ts`

**Purpose**: Data hook for prayer.
**Checklist:**
- [ ] Uses TanStack Query with stable keys and cache times
- [ ] Optimistic updates where relevant; invalidates on success
- [ ] Cancels in-flight queries on unmount if appropriate
**Definition of Done:**
- [ ] Hook returns typed data; suspense/loader works

### `mobile/src/features/prayer/hooks/usePrayerReaction.ts`

**Purpose**: Data hook for prayer.
**Checklist:**
- [ ] Uses TanStack Query with stable keys and cache times
- [ ] Optimistic updates where relevant; invalidates on success
- [ ] Cancels in-flight queries on unmount if appropriate
**Definition of Done:**
- [ ] Hook returns typed data; suspense/loader works

### `mobile/src/features/prayer/hooks/usePrayers.ts`

**Purpose**: Data hook for prayer.
**Checklist:**
- [ ] Uses TanStack Query with stable keys and cache times
- [ ] Optimistic updates where relevant; invalidates on success
- [ ] Cancels in-flight queries on unmount if appropriate
**Definition of Done:**
- [ ] Hook returns typed data; suspense/loader works

### `mobile/src/features/prayer/api.ts`

**Purpose**: API layer for prayer feature.
**Checklist:**
- [ ] Wraps Supabase calls; always filters by `org_id`
- [ ] No service role; client-side only anon/anon+user
**Definition of Done:**
- [ ] Network errors mapped to typed error objects

### `mobile/src/features/prayer/types.ts`

**Purpose**: Types for prayer feature.
**Checklist:**
- [ ] Exports TypeScript types/interfaces only; no runtime
**Definition of Done:**
- [ ] Imports cause no side effects; builds fast

### `mobile/src/lib/apiClient.ts`

**Purpose**: HTTP helper or Supabase client wrappers.
**Checklist:**
- [ ] Tree-shakeable; no side effects on import
- [ ] Typed exports and unit-testable functions
**Definition of Done:**
- [ ] Used across features without circular imports

### `mobile/src/lib/logs.ts`

**Purpose**: Client-side log helper (info/warn/error) with metadata.
**Checklist:**
- [ ] Tree-shakeable; no side effects on import
- [ ] Typed exports and unit-testable functions
**Definition of Done:**
- [ ] Used across features without circular imports

### `mobile/src/lib/navigation.ts`

**Purpose**: Navigation helpers for Router.
**Checklist:**
- [ ] Tree-shakeable; no side effects on import
- [ ] Typed exports and unit-testable functions
**Definition of Done:**
- [ ] Used across features without circular imports

### `mobile/src/lib/notifications.ts`

**Purpose**: Client push helpers (permission, register, build payload).
**Checklist:**
- [ ] Tree-shakeable; no side effects on import
- [ ] Typed exports and unit-testable functions
**Definition of Done:**
- [ ] Used across features without circular imports

### `mobile/src/lib/patchExpoGoConsole.ts`

**Purpose**: Optional console patching for noisy logs in Expo Go.
**Checklist:**
- [ ] Tree-shakeable; no side effects on import
- [ ] Typed exports and unit-testable functions
**Definition of Done:**
- [ ] Used across features without circular imports

### `mobile/src/lib/queryClient.ts`

**Purpose**: Create and export TanStack Query client + persistence.
**Checklist:**
- [ ] Tree-shakeable; no side effects on import
- [ ] Typed exports and unit-testable functions
**Definition of Done:**
- [ ] Used across features without circular imports

### `mobile/src/lib/storage.ts`

**Purpose**: Local storage helpers (AsyncStorage keys).
**Checklist:**
- [ ] Tree-shakeable; no side effects on import
- [ ] Typed exports and unit-testable functions
**Definition of Done:**
- [ ] Used across features without circular imports

### `mobile/src/lib/time.ts`

**Purpose**: Date/time helpers (UTC handling).
**Checklist:**
- [ ] Tree-shakeable; no side effects on import
- [ ] Typed exports and unit-testable functions
**Definition of Done:**
- [ ] Used across features without circular imports

### `mobile/src/lib/validators.ts`

**Purpose**: zod/yup schemas for inputs.
**Checklist:**
- [ ] Tree-shakeable; no side effects on import
- [ ] Typed exports and unit-testable functions
**Definition of Done:**
- [ ] Used across features without circular imports

### `mobile/src/lib/supabase.ts`

**Purpose**: Typed `createClient<Database>()` instance.
**Checklist:**
- [ ] Tree-shakeable; no side effects on import
- [ ] Typed exports and unit-testable functions
**Definition of Done:**
- [ ] Used across features without circular imports

### `mobile/src/navigation/FloatingTabBar.tsx`

**Purpose**: Custom tab bar component.
**Checklist:**
- [ ] Works with safe areas; keyboard avoidance handled
- [ ] Accessible labels; minimum hit size
**Definition of Done:**
- [ ] No layout shifts; behaves on iOS/Android

### `mobile/src/providers/AppProviders.tsx`

**Purpose**: App-level providers (QueryClient, Theme, SafeArea).
**Checklist:**
- [ ] Includes PersistQueryClientProvider and hydration
- [ ] Handles color scheme / font loading
**Definition of Done:**
- [ ] App renders after providers mount; no flicker beyond splash

### `mobile/src/store/auth.ts`

**Purpose**: Zustand or context store for app state.
**Checklist:**
- [ ] Typed selectors; no unbounded re-renders
- [ ] Auth store supports anonymous sessions and upgrade flow
**Definition of Done:**
- [ ] No circular deps; serialization safe for persistence if used

### `mobile/src/store/featureFlags.ts`

**Purpose**: Zustand or context store for app state.
**Checklist:**
- [ ] Typed selectors; no unbounded re-renders
- [ ] Auth store supports anonymous sessions and upgrade flow
**Definition of Done:**
- [ ] No circular deps; serialization safe for persistence if used

### `mobile/src/store/index.ts`

**Purpose**: Zustand or context store for app state.
**Checklist:**
- [ ] Typed selectors; no unbounded re-renders
- [ ] Auth store supports anonymous sessions and upgrade flow
**Definition of Done:**
- [ ] No circular deps; serialization safe for persistence if used

### `mobile/src/tests/e2e/.gitkeep`

**Purpose**: Keep e2e folder in VCS.
**Checklist:**
- [ ] Placeholder only
**Definition of Done:**
- [ ] Folder exists for future tests

### `mobile/src/tests/unit/.gitkeep`

**Purpose**: Keep unit test folder in VCS.
**Checklist:**
- [ ] Placeholder only
**Definition of Done:**
- [ ] Folder exists for future tests

### `mobile/src/ui/Button.tsx`

**Purpose**: Reusable UI primitive.
**Checklist:**
- [ ] Accepts testID, accessibilityLabel, and className/style
- [ ] No business logic; visually consistent
**Definition of Done:**
- [ ] Used across screens; no prop type mismatches

### `mobile/src/ui/Card.tsx`

**Purpose**: Reusable UI primitive.
**Checklist:**
- [ ] Accepts testID, accessibilityLabel, and className/style
- [ ] No business logic; visually consistent
**Definition of Done:**
- [ ] Used across screens; no prop type mismatches

### `mobile/src/ui/ErrorState.tsx`

**Purpose**: Reusable UI primitive.
**Checklist:**
- [ ] Accepts testID, accessibilityLabel, and className/style
- [ ] No business logic; visually consistent
**Definition of Done:**
- [ ] Used across screens; no prop type mismatches

### `mobile/src/ui/ListEmpty.tsx`

**Purpose**: Reusable UI primitive.
**Checklist:**
- [ ] Accepts testID, accessibilityLabel, and className/style
- [ ] No business logic; visually consistent
**Definition of Done:**
- [ ] Used across screens; no prop type mismatches

### `mobile/src/ui/Spinner.tsx`

**Purpose**: Reusable UI primitive.
**Checklist:**
- [ ] Accepts testID, accessibilityLabel, and className/style
- [ ] No business logic; visually consistent
**Definition of Done:**
- [ ] Used across screens; no prop type mismatches

### `mobile/src/ui/Text.tsx`

**Purpose**: Reusable UI primitive.
**Checklist:**
- [ ] Accepts testID, accessibilityLabel, and className/style
- [ ] No business logic; visually consistent
**Definition of Done:**
- [ ] Used across screens; no prop type mismatches

### `mobile/supabase/config.toml`

**Purpose**: Supabase local dev config (if used in app workspace).
**Checklist:**
- [ ] Matches project ID; no secrets committed
**Definition of Done:**
- [ ] CLI commands work in `mobile/` if needed

### `mobile/supabase/.branches/_current_branch`

**Purpose**: CLI metadata (auto-generated).
**Checklist:**
- [ ] Committed only if required by workflow
**Definition of Done:**
- [ ] No conflicts with root supabase config

### `mobile/supabase/.temp/cli-latest`

**Purpose**: CLI cache marker.
**Checklist:**
- [ ] Generated by CLI; safe to ignore if not needed
**Definition of Done:**
- [ ] Does not break CLI usage