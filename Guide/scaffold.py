
#!/usr/bin/env python3
"""
Scaffold the LibertyConnect monorepo structure with Expo (mobile) + Supabase (functions/migrations) + docs.
- Creates directories and placeholder files.
- Writes the two package.json files EXACTLY as provided in the prompt.
- Idempotent: re-running won't overwrite existing files unless --force is passed.

Usage:
  python scaffold_libertyconnect.py [--root ./LibertyConnect] [--force]
"""
import argparse
from pathlib import Path

ROOT_DEFAULT = Path("LibertyConnect")

ROOT_PACKAGE_JSON = """{
  "name": "libertyconnect",
  "private": true,
  "type": "module",
  "workspaces": [
    "mobile"
  ],
  "packageManager": "npm@10.0.0",
  "scripts": {
    "fmt": "prettier . --write",
    "lint": "eslint .",
    "typecheck": "npm -w mobile run typecheck",
    "start": "npm -w mobile run start",
    "check": "npm -w mobile run check",
    "doctor": "npx expo-doctor"
  },
  "devDependencies": {
    "eslint": "^9.14.0",
    "@eslint/js": "^9.14.0",
    "typescript-eslint": "^8.46.0",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^7.0.0",
    "eslint-config-prettier": "10.1.8",
    "prettier": "^3.3.3"
  },
  "overrides": {
    "react": "19.1.0",
    "react-dom": "19.1.0"
  }
}
"""

MOBILE_PACKAGE_JSON = """{
  "name": "@libertyconnect/mobile",
  "version": "0.1.0",
  "private": true,
  "main": "index.js",
  "sideEffects": false,
  "scripts": {
    "start": "npx expo start",
    "android": "npx expo run:android",
    "ios": "npx expo run:ios",
    "test": "jest",
    "lint": "eslint app src --ext .ts,.tsx",
    "typecheck": "tsc --noEmit",
    "check": "npx expo install --check",
    "fix": "npx expo install --fix"
  },
  "dependencies": {
    "@expo/metro-runtime": "^6.1.2",
    "@shopify/flash-list": "2.0.2",
    "@tanstack/react-query": "^5.90.3",
    "date-fns": "^4.1.0",
    "date-fns-tz": "^3.2.0",
    "expo": "^54.0.13",
    "expo-blur": "~15.0.7",
    "expo-haptics": "~15.0.7",
    "expo-image": "~3.0.9",
    "expo-notifications": "~0.32.12",
    "expo-router": "~6.0.12",
    "expo-secure-store": "~15.0.7",
    "expo-status-bar": "~3.0.8",
    "nativewind": "^4.2.1",
    "react": "19.1.0",
    "react-hook-form": "^7.53.0",
    "react-native": "0.81.4",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-worklets": "~0.5.1",
    "tailwindcss": "^3.4.18",
    "zod": "^3.25.76",
    "zustand": "^4.5.7"
  },
  "devDependencies": {
    "@testing-library/react-native": "^13.3.3",
    "@types/react": "~19.1.10",
    "jest-expo": "~54.0.0",
    "react-test-renderer": "19.1.0",
    "typescript": "^5.6.3"
  }
}
"""

EDITORCONFIG = """# Consistent editor behavior
root = true

[*]
end_of_line = lf
insert_final_newline = true
charset = utf-8
indent_style = space
indent_size = 2
trim_trailing_whitespace = true
"""

PRETTIERRC = """{
  "singleQuote": false,
  "semi": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 100
}
"""

GITIGNORE = """# Node/Expo/React Native
node_modules/
.expo/
.expo-shared/
dist/
.expo/*/devices.json

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
*.log

# OS
.DS_Store
Thumbs.db

# TypeScript build output
*.tsbuildinfo

# Expo/Metro caches
.expo/
.cache/
.expo-internal/

# Env
.env
.env.*.local

# Jest
coverage/

# Supabase
supabase/.branches/
supabase/.temp/
"""

ROOT_ESLINT = """// Flat config for ESLint v9
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactPlugin from "eslint-plugin-react";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { "react-hooks": reactHooks, "react": reactPlugin },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  }
];
"""

ROOT_TSCONFIG = """{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
"""

MOBILE_TSCONFIG = """{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "types": ["react", "react-native", "expo-router"],
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["app", "src", "expo-env.d.ts"]
}
"""

APP_CONFIG_TS = """import { ExpoConfig } from "expo/config";

const scheme = "myapp";
const expoConfig: ExpoConfig = {
  name: "LibertyConnect",
  slug: "libertyconnect",
  scheme,
  ios: {
    bundleIdentifier: "com.example.libertyconnect",
    associatedDomains: ["applinks:example.com"]
  },
  android: {
    package: "com.example.libertyconnect",
    intentFilters: [
      {
        action: "VIEW",
        data: [{ scheme }, { host: "example.com", scheme: "https" }],
        category: ["BROWSABLE", "DEFAULT"]
      }
    ]
  },
  experiments: { typedRoutes: true }
};

export default expoConfig;
"""

EXPO_INDEX_JS = "import 'expo-router/entry';\n"

GLOBAL_CSS = "/* Tailwind base import if using NativeWind */\n"

TAILWIND_CONFIG = """/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: []
};
"""

BABEL_CONFIG = """module.exports = function(api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["react-native-reanimated/plugin"]
  };
};
"""

MOBILE_ENV = "EXPO_PUBLIC_SUPABASE_URL=\nEXPO_PUBLIC_SUPABASE_ANON_KEY=\n"
MOBILE_ENV_PROD = "EXPO_PUBLIC_SUPABASE_URL=\nEXPO_PUBLIC_SUPABASE_ANON_KEY=\n"

SUPABASE_CONFIG_TOML = "project_id = \"libertyconnect\"\n[functions]\n"

TS_STUB = "// TODO: implement\n"
SQL_STUB = "-- TODO: add actual SQL migration statements\n"
MD_STUB = "# TODO\n\nAdd detailed documentation here.\n"

def write(path: Path, content: str, force: bool = False):
  path.parent.mkdir(parents=True, exist_ok=True)
  if path.exists() and not force:
    return
  path.write_text(content, encoding="utf-8")

def touch_gitkeep(dir_path: Path):
  dir_path.mkdir(parents=True, exist_ok=True)
  keep = dir_path / ".gitkeep"
  if not keep.exists():
    keep.write_text("", encoding="utf-8")

def main(root: Path, force: bool):
  # Directories
  dir_list = [
    ".expo",
    "docs",
    "supabase/functions/_shared",
    "supabase/functions/announcement_create",
    "supabase/functions/api",
    "supabase/functions/devotional_upsert",
    "supabase/functions/event_create",
    "supabase/functions/event_reminder_30m",
    "supabase/functions/event_rsvp",
    "supabase/functions/maintenance-ttl",
    "supabase/functions/prayer_create",
    "supabase/functions/prayer_react",
    "supabase/functions/save_device_token",
    "supabase/functions/push_receipts",
    "supabase/functions/impersonate",
    "supabase/functions/report_action",
    "supabase/functions/notification_prefs_upsert",
    "supabase/functions/search",
    "supabase/migrations",
    "supabase/seed",
    "supabase/tests",
    "mobile/.expo/types",
    "mobile/.vscode",
    "mobile/app/(auth)",
    "mobile/app/(future)",
    "mobile/app/(modals)",
    "mobile/app/(tabs)",
    "mobile/app/event",
    "mobile/app/prayer",
    "mobile/app/admin",
    "mobile/src/assets/fonts",
    "mobile/src/assets/icons",
    "mobile/src/assets/images",
    "mobile/src/constants",
    "mobile/src/features/announcements/components",
    "mobile/src/features/announcements/hooks",
    "mobile/src/features/devotional/components",
    "mobile/src/features/devotional/hooks",
    "mobile/src/features/events/components",
    "mobile/src/features/events/hooks",
    "mobile/src/features/home/components",
    "mobile/src/features/home/hooks",
    "mobile/src/features/notifications",
    "mobile/src/features/prayer/components",
    "mobile/src/features/prayer/hooks",
    "mobile/src/features/moderation/components",
    "mobile/src/features/moderation/hooks",
    "mobile/src/features/preferences/hooks",
    "mobile/src/features/search/hooks",
    "mobile/src/lib",
    "mobile/src/navigation",
    "mobile/src/providers",
    "mobile/src/store",
    "mobile/src/types",
    "mobile/src/tests/e2e",
    "mobile/src/tests/unit",
    "mobile/src/ui",
    "mobile/supabase/.branches",
    "mobile/supabase/.temp"
  ]
  for d in dir_list:
    touch_gitkeep(root / d)

  # Files
  files = {
    ".editorconfig": EDITORCONFIG,
    ".prettierrc": PRETTIERRC,
    ".gitignore": GITIGNORE,
    "README.md": "# LibertyConnect Monorepo\n\nGenerated by scaffold script. See docs/ for guides.\n",
    "package.json": ROOT_PACKAGE_JSON,
    "package-lock.json": "",
    "tsconfig.json": ROOT_TSCONFIG,
    "eslint.config.js": ROOT_ESLINT,
    "file-tree.txt": "",
    "eas.json": "{\n  \"cli\": { \"version\": \">= 11.0.0\" }\n}\n",
    "docs/logic_flow.md": "# Logic Flow\n\nSee docs in this repo; fill in details as you build.\n",
    "docs/deep-linking.md": MD_STUB,
    "docs/ugc-compliance.md": MD_STUB,
    "docs/storage-rls.md": MD_STUB,
    "docs/auth.md": MD_STUB,
    "docs/data-model.md": MD_STUB,
    "supabase/functions/_shared/auth.ts": "// shared auth helpers\n",
    "supabase/functions/_shared/http.ts": "// shared http helpers\n",
    "supabase/functions/_shared/mod.ts": "// export shared utils\n",
    "supabase/functions/_shared/push.ts": "// push helpers (Expo)\n",
    "supabase/functions/_shared/supabase.ts": "// server-side Supabase client\n",
    "supabase/functions/announcement_create/index.ts": TS_STUB,
    "supabase/functions/api/index.ts": TS_STUB,
    "supabase/functions/devotional_upsert/index.ts": TS_STUB,
    "supabase/functions/event_create/index.ts": TS_STUB,
    "supabase/functions/event_reminder_30m/index.ts": TS_STUB,
    "supabase/functions/event_rsvp/index.ts": TS_STUB,
    "supabase/functions/maintenance-ttl/index.ts": TS_STUB,
    "supabase/functions/prayer_create/index.ts": TS_STUB,
    "supabase/functions/prayer_react/index.ts": TS_STUB,
    "supabase/functions/save_device_token/index.ts": TS_STUB,
    "supabase/functions/push_receipts/index.ts": TS_STUB,
    "supabase/functions/impersonate/index.ts": TS_STUB,
    "supabase/functions/report_action/index.ts": TS_STUB,
    "supabase/functions/notification_prefs_upsert/index.ts": TS_STUB,
    "supabase/functions/search/index.ts": TS_STUB,
    "supabase/migrations/000_init.sql": SQL_STUB,
    "supabase/migrations/010_cron_ttls.sql": SQL_STUB,
    "supabase/migrations/020_cron_reminders.sql": SQL_STUB,
    "supabase/migrations/030_storage_policies.sql": SQL_STUB,
    "supabase/migrations/040_search_fts.sql": SQL_STUB,
    "supabase/migrations/050_rls_policies.sql": SQL_STUB,
    "supabase/seed/visible-content.sql": "-- initial visible content seed\n",
    "supabase/seed/demo-org-and-users.sql": "-- demo org + users\n",
    "supabase/tests/000-setup-tests-hooks.sql": SQL_STUB,
    "supabase/tests/010-rls-enabled-all.sql": SQL_STUB,
    "supabase/tests/020-rls-tenancy-policies.sql": SQL_STUB,
    "supabase/tests/030-storage-policies.sql": SQL_STUB,
    "supabase/tests/040-search-queries.sql": SQL_STUB,
    "mobile/.expo/types/router.d.ts": "declare module 'expo-router' {}\n",
    "mobile/.expo/devices.json": "{}\n",
    "mobile/.expo/README.md": "Expo local state\n",
    "mobile/.vscode/extensions.json": "{ \"recommendations\": [\"dbaeumer.vscode-eslint\", \"esbenp.prettier-vscode\"] }\n",
    "mobile/.vscode/settings.json": "{ \"editor.formatOnSave\": true }\n",
    "mobile/app/(auth)/_layout.tsx": "export default function Layout(){return null}\n",
    "mobile/app/(auth)/register.tsx": "export default function Register(){return null}\n",
    "mobile/app/(auth)/sign-in.tsx": "export default function SignIn(){return null}\n",
    "mobile/app/(future)/_layout.tsx": "export default function Layout(){return null}\n",
    "mobile/app/(future)/dashboard.tsx": "export default function Dashboard(){return null}\n",
    "mobile/app/(future)/groups.tsx": "export default function Groups(){return null}\n",
    "mobile/app/(modals)/_layout.tsx": "export default function Layout(){return null}\n",
    "mobile/app/(modals)/admin-announcement.tsx": "export default function AdminAnnouncement(){return null}\n",
    "mobile/app/(modals)/admin-devotional.tsx": "export default function AdminDevotional(){return null}\n",
    "mobile/app/(modals)/admin-event.tsx": "export default function AdminEvent(){return null}\n",
    "mobile/app/(modals)/report.tsx": "export default function Report(){return null}\n",
    "mobile/app/(tabs)/_layout.tsx": "export default function Tabs(){return null}\n",
    "mobile/app/(tabs)/events.tsx": "export default function Events(){return null}\n",
    "mobile/app/(tabs)/index.tsx": "export default function Home(){return null}\n",
    "mobile/app/(tabs)/prayer.tsx": "export default function Prayer(){return null}\n",
    "mobile/app/event/[id].tsx": "export default function EventDetail(){return null}\n",
    "mobile/app/prayer/[id].tsx": "export default function PrayerDetail(){return null}\n",
    "mobile/app/admin/reports.tsx": "export default function Reports(){return null}\n",
    "mobile/app/admin/impersonate.tsx": "export default function Impersonate(){return null}\n",
    "mobile/app/+not-found.tsx": "export default function NotFound(){return null}\n",
    "mobile/app/_layout.tsx": "export default function RootLayout(){return null}\n",
    "mobile/src/assets/fonts/README.md": "Place custom fonts here\n",
    "mobile/src/constants/env.ts": "export const ENV = {};\n",
    "mobile/src/constants/routes.ts": "export const ROUTES = {};\n",
    "mobile/src/constants/tokens.ts": "export const TOKENS = {};\n",
    "mobile/src/constants/ttl.ts": "export const TTL = {};\n",
    "mobile/src/constants/links.ts": "export const LINKS = {};\n",
    "mobile/src/features/announcements/components/AnnouncementCard.tsx": TS_STUB,
    "mobile/src/features/announcements/components/AnnouncementList.tsx": TS_STUB,
    "mobile/src/features/announcements/hooks/useAnnouncements.ts": TS_STUB,
    "mobile/src/features/announcements/api.ts": TS_STUB,
    "mobile/src/features/announcements/types.ts": TS_STUB,
    "mobile/src/features/devotional/components/DevotionalCard.tsx": TS_STUB,
    "mobile/src/features/devotional/hooks/useDevotional.ts": TS_STUB,
    "mobile/src/features/devotional/api.ts": TS_STUB,
    "mobile/src/features/devotional/types.ts": TS_STUB,
    "mobile/src/features/events/components/EventDetails.tsx": TS_STUB,
    "mobile/src/features/events/components/EventList.tsx": TS_STUB,
    "mobile/src/features/events/components/RSVPButton.tsx": TS_STUB,
    "mobile/src/features/events/hooks/useEvent.ts": TS_STUB,
    "mobile/src/features/events/hooks/useEvents.ts": TS_STUB,
    "mobile/src/features/events/hooks/useRSVP.ts": TS_STUB,
    "mobile/src/features/events/api.ts": TS_STUB,
    "mobile/src/features/events/types.ts": TS_STUB,
    "mobile/src/features/home/components/HomeScreen.tsx": TS_STUB,
    "mobile/src/features/home/hooks/useHomeSnapshot.ts": TS_STUB,
    "mobile/src/features/notifications/deeplinks.ts": TS_STUB,
    "mobile/src/features/notifications/handleNotificationTap.ts": TS_STUB,
    "mobile/src/features/notifications/registerPush.ts": TS_STUB,
    "mobile/src/features/prayer/components/ComposePrayerSheet.tsx": TS_STUB,
    "mobile/src/features/prayer/components/PrayerCard.tsx": TS_STUB,
    "mobile/src/features/prayer/hooks/useComposePrayer.ts": TS_STUB,
    "mobile/src/features/prayer/hooks/usePrayer.ts": TS_STUB,
    "mobile/src/features/prayer/hooks/usePrayerReaction.ts": TS_STUB,
    "mobile/src/features/prayer/hooks/usePrayers.ts": TS_STUB,
    "mobile/src/features/prayer/api.ts": TS_STUB,
    "mobile/src/features/prayer/types.ts": TS_STUB,
    "mobile/src/features/moderation/components/ReportButton.tsx": TS_STUB,
    "mobile/src/features/moderation/hooks/useReports.ts": TS_STUB,
    "mobile/src/features/moderation/api.ts": TS_STUB,
    "mobile/src/features/moderation/types.ts": TS_STUB,
    "mobile/src/features/preferences/hooks/useNotificationPrefs.ts": TS_STUB,
    "mobile/src/features/preferences/api.ts": TS_STUB,
    "mobile/src/features/preferences/types.ts": TS_STUB,
    "mobile/src/features/search/hooks/useSearch.ts": TS_STUB,
    "mobile/src/features/search/api.ts": TS_STUB,
    "mobile/src/features/search/types.ts": TS_STUB,
    "mobile/src/lib/apiClient.ts": TS_STUB,
    "mobile/src/lib/logs.ts": TS_STUB,
    "mobile/src/lib/navigation.ts": TS_STUB,
    "mobile/src/lib/notifications.ts": TS_STUB,
    "mobile/src/lib/patchExpoGoConsole.ts": TS_STUB,
    "mobile/src/lib/queryClient.ts": TS_STUB,
    "mobile/src/lib/storage.ts": TS_STUB,
    "mobile/src/lib/time.ts": TS_STUB,
    "mobile/src/lib/validators.ts": TS_STUB,
    "mobile/src/lib/supabase.ts": TS_STUB,
    "mobile/src/navigation/FloatingTabBar.tsx": TS_STUB,
    "mobile/src/providers/AppProviders.tsx": TS_STUB,
    "mobile/src/store/auth.ts": TS_STUB,
    "mobile/src/store/featureFlags.ts": TS_STUB,
    "mobile/src/store/index.ts": TS_STUB,
    "mobile/src/types/database.types.ts": "// Generated by `supabase gen types typescript --project-id ...`\n",
    "mobile/src/tests/setup.ts": TS_STUB,
    "mobile/src/ui/Button.tsx": TS_STUB,
    "mobile/src/ui/Card.tsx": TS_STUB,
    "mobile/src/ui/ErrorState.tsx": TS_STUB,
    "mobile/src/ui/ListEmpty.tsx": TS_STUB,
    "mobile/src/ui/Spinner.tsx": TS_STUB,
    "mobile/src/ui/Text.tsx": TS_STUB,
    "mobile/supabase/config.toml": SUPABASE_CONFIG_TOML,
    "mobile/.env": MOBILE_ENV,
    "mobile/.env.production": MOBILE_ENV_PROD,
    "mobile/app.config.ts": APP_CONFIG_TS,
    "mobile/babel.config.js": BABEL_CONFIG,
    "mobile/expo-env.d.ts": "/// <reference types=\"expo-env\" />\n",
    "mobile/global.css": GLOBAL_CSS,
    "mobile/index.js": EXPO_INDEX_JS,
    "mobile/metro.config.js": "module.exports = {};\n",
    "mobile/nativewind-env.d.ts": "/// <reference types=\"nativewind/types\" />\n",
    "mobile/package.json": MOBILE_PACKAGE_JSON,
    "mobile/tailwind.config.js": TAILWIND_CONFIG,
    "mobile/tsconfig.json": MOBILE_TSCONFIG,
    "mobile/.gitignore": GITIGNORE
  }
  for rel, content in files.items():
    write(root / rel, content, force)

  print(f"Scaffold complete at: {root.resolve()}")

if __name__ == "__main__":
  ap = argparse.ArgumentParser()
  ap.add_argument("--root", type=Path, default=ROOT_DEFAULT, help="Root directory to scaffold")
  ap.add_argument("--force", action="store_true", help="Overwrite existing files if present")
  ns = ap.parse_args()
  main(ns.root, ns.force)
