# Rallx Wealth

Rallx Wealth is a pnpm workspace managed with Turborepo. It contains an offline-first Expo app, a Next.js web app, an Express API, and shared TypeScript packages.

## Repository layout

| Path | Purpose |
| --- | --- |
| `apps/mobile` | Expo Router app for iOS and Android. WatermelonDB stores data locally in SQLite. |
| `apps/web` | Next.js web app. |
| `apps/api` | Express API with a health endpoint and optional MongoDB connection. |
| `packages/types-common` | Shared form inputs and domain types. |
| `packages/types-database` | Platform-neutral database record contracts. |
| `packages/utils-database` | Shared write preparation, FIFO sale planning, and record summaries. |
| `packages/utils-frontend` | Shared display formatting, input parsing, grouping, and stock symbol helpers. |

The mobile app keeps its WatermelonDB models, schema, migrations, controllers, backup and restore, and native integrations in `apps/mobile`. The web app and API do not currently connect to one another, and the API does not yet expose finance or authentication features.

## Requirements

- Node.js 20.19 or newer
- pnpm 10.21.0 (the version pinned by the root `package.json`)

## Install and start

Install dependencies from the repository root:

```bash
pnpm install
```

Start the web app and API together:

```bash
pnpm dev
```

The web app is available at [http://localhost:3000](http://localhost:3000). The API listens at [http://127.0.0.1:4000](http://127.0.0.1:4000). Turbo builds the shared runtime packages before starting dependent apps and watches them for changes.

The API can run without MongoDB. To enable its startup connection check, copy the example environment file and set `MONGODB_URI`:

```bash
cp apps/api/.env.example apps/api/.env
```

When configured, the API connects to MongoDB and pings it at startup. The example URI points to a local database named `rallx_wealth`; make sure MongoDB is running or replace the URI with your connection string. Keep credentials in the ignored `.env` file and do not commit them.

Check the API health endpoint with:

```bash
curl http://127.0.0.1:4000/health
```

It returns `status: "ok"` and reports the database as `connected` when a MongoDB URI is configured, or `not_configured` otherwise.

## Run an app on its own

Run a workspace package with a pnpm filter:

```bash
# Expo mobile app
pnpm --filter @rallx-wealth/mobile start
pnpm --filter @rallx-wealth/mobile ios
pnpm --filter @rallx-wealth/mobile android
pnpm --filter @rallx-wealth/mobile web

# Next.js web app
pnpm --filter @rallx-wealth/web dev

# Express API
pnpm --filter @rallx-wealth/api dev
```

At the repository root, `pnpm start`, `pnpm ios`, and `pnpm android` are shortcuts for the mobile app; `pnpm web` starts the Next.js app. Expo's web target is separate and starts with `pnpm --filter @rallx-wealth/mobile web`.

Run EAS commands from `apps/mobile`, where the Expo and EAS configuration files are located.

## Workspace checks

Run the workspace build, lint, and type checks from the root:

```bash
pnpm build
pnpm lint
pnpm typecheck
```

The shared utility packages also define focused tests that can be run individually:

```bash
pnpm --filter @rallx-wealth/utils-database test
pnpm --filter @rallx-wealth/utils-frontend test
```

## Shared packages

Apps should use platform-neutral contracts and pure utilities from `packages/*`. Keep React Native components, native APIs, and WatermelonDB code inside `apps/mobile`; do not import them into the web app or API. MongoDB-specific persistence types belong in `apps/api/src/data/mongodbTypes.ts`.

Package documentation:

- [Common types](packages/types-common/README.md)
- [Database types](packages/types-database/README.md)
- [Database utilities](packages/utils-database/README.md)
- [Frontend utilities](packages/utils-frontend/README.md)
