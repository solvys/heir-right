# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

This is the **Probate Lead Engine (PLE)** — a TypeScript monorepo (Turborepo + pnpm workspaces) for probate/heir-property lead processing. The codebase lives in `probate-lead-engine/`.

### Workspace layout

```
probate-lead-engine/
├── packages/types/    # @ple/types — shared TypeScript types
├── apps/worker/       # @ple/worker — dry-run pipeline CLI + Cloudflare Worker
└── apps/artifact/     # @ple/artifact — operator dashboard (vanilla HTML served by Node)
```

### Standard commands

All commands run from `probate-lead-engine/`:

| Action | Command |
|--------|---------|
| Install deps | `pnpm install` |
| Build all | `pnpm build` |
| Lint | `pnpm lint` |
| Test | `pnpm test` |
| Run dry-run pipeline | `pnpm --filter @ple/worker run:dry -- --address="<addr>" --owner="<name>"` |
| Start artifact dashboard | `pnpm --filter @ple/artifact dev` (serves on port 4173) |
| Cloudflare local dev | `pnpm --filter @ple/worker dev:cloudflare` |

### Non-obvious notes

- The `lint` task in turbo.json depends on `^build`, but no individual packages define a lint script — it effectively validates that `@ple/types` builds cleanly (the build is the lint).
- The artifact dashboard (`@ple/artifact dev`) reads from `apps/worker/output/latest-run.json`. You must run the worker dry-run at least once before starting the dashboard, otherwise it will serve a page with no data.
- The worker's `test` script runs `node dist/validation/run-validation.js` — this requires the project to be built first (`pnpm build`).
- No databases, Docker, or external services are required for the dry-run pipeline. All output is file-based (`apps/worker/output/`).
- `pnpm@10.x` works fine with this project despite `packageManager` declaring `pnpm@9.15.0`.
- Node.js ≥ 20 is required (`engines.node` in root package.json).
