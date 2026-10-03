# AGENTS.md

Guidance for work in the Rallx Wealth monorepo.

## Workspace layout

- `apps/mobile` — existing offline-first Expo SDK 54 / Expo Router app for iOS and Android.
- `apps/web` — Next.js web app.
- `apps/api` — Express TypeScript API service with the MongoDB Node.js driver.
- `packages/*` — future platform-neutral shared packages. Keep platform-specific code out of these packages.

Use pnpm workspaces and Turbo from the repository root. The mobile app uses native WatermelonDB, Expo file and sharing APIs, and a patched native ZIP package. Do not import its models, controllers, or components directly into the web app or API. Extract genuinely cross-platform domain types or pure utilities into a shared package when needed.

## Commands

```bash
pnpm install
pnpm dev                       # start web and API in parallel
pnpm --filter @rallx/mobile start
pnpm --filter @rallx/mobile ios
pnpm --filter @rallx/mobile android
pnpm --filter @rallx/mobile web
pnpm build
pnpm lint
pnpm typecheck
```

Expo Application Services commands should run from `apps/mobile`, where `app.json` and `eas.json` live. The dedicated web app is `apps/web`; `@rallx/mobile web` remains Expo's web target and is separate.

## Mobile app

- Expo Router screens and layouts live in `apps/mobile/src/app/`.
- Data code lives in `apps/mobile/src/data/`; keep WatermelonDB data access in its existing controllers and models.
- The schema and all model definitions are mobile-local. SQLite is the local offline store; the API workspace currently contains only a health endpoint and is not wired to the mobile app.
- Models use legacy WatermelonDB decorators imported from `@nozbe/watermelondb/decorators`. Decorator support is configured in `apps/mobile/babel.config.js` and `apps/mobile/tsconfig.json`.
- The mobile `@/*` alias maps to `apps/mobile/src/*`.
- Use Expo-compatible package versions and `pnpm --filter @rallx/mobile exec expo install <package>` when adding native or Expo packages.

## Web and API

- Keep web-only pages and styles under `apps/web/app/`.
- Keep API routes and server code under `apps/api/src/`; do not add authentication or finance business logic until its design is agreed.
- The API currently serves `GET /health` on port 4000. When `MONGODB_URI` is configured it checks the database connection at startup. The web app is a landing-page scaffold and does not yet call the API.

## Data / security

Financial data is sensitive. Avoid logging account or transaction data, and keep secrets in local environment files (ignored by git). Do not commit credentials or real financial records.

## Mockups

Save downloaded design mockups in the root `mockups/` directory.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
