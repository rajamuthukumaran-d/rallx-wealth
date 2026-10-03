# Rallx Wealth

Rallx Wealth is a pnpm + Turborepo monorepo containing the Expo mobile app, a Next.js web app, and an Express API backed by MongoDB.

## Apps

- `apps/mobile` — the existing offline-first Expo app for iOS and Android. It uses WatermelonDB/SQLite locally.
- `apps/web` — Next.js website scaffold.
- `apps/api` — Express TypeScript API scaffold with `GET /health` and optional MongoDB startup connectivity.

The mobile app is intentionally isolated: its database, backup/restore, and device integrations depend on React Native and native modules. The web app and API do not yet share domain code or connect to each other.

## Setup

Requirements: Node.js 20.19 or newer (Expo SDK 54), pnpm 10.21 or compatible.

```bash
pnpm install
pnpm dev
```

`pnpm dev` starts the web app at http://localhost:3000 and the API at http://127.0.0.1:4000. Copy `apps/api/.env.example` to `apps/api/.env` and set `MONGODB_URI` to enable database connectivity.

The root `pnpm start`, `pnpm ios`, and `pnpm android` commands remain shortcuts for the mobile app. `pnpm web` starts the dedicated Next.js app; use `pnpm --filter @rallx/mobile web` for Expo web.

Run one app with a workspace filter:

```bash
pnpm --filter @rallx/mobile start
pnpm --filter @rallx/mobile ios
pnpm --filter @rallx/mobile android
pnpm --filter @rallx/mobile web
pnpm --filter @rallx/web dev
pnpm --filter @rallx/api dev
```

Run workspace tasks with Turbo:

```bash
pnpm build
pnpm lint
pnpm typecheck
```

Run EAS commands from `apps/mobile` so Expo configuration is discovered correctly.
