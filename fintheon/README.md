# Fintheon product funnel

Marketing site → sign-up (Google OAuth + email) → onboarding with DMG download → desktop app with Local Hermes auto-discovery.

## Architecture

| App | Path | Purpose |
|-----|------|---------|
| **Site** | `apps/site` | Public marketing website (Vite) |
| **Web** | `apps/web` | Auth + onboarding + GitHub release DMG API (Next.js + Clerk) |
| **Desktop** | `apps/desktop` | macOS Electron app with autoupdater + Hermes routing |
| **Hermes** | `packages/hermes` | Local/Cloud Hermes client — port detection, health checks, action execution |

## Hermes modes

- **Local Hermes** — runs on the user's machine. Fintheon reads `~/.hermes/config.json`, detects the port, and routes all local agentic actions through it.
- **Cloud Hermes** — hosted runtime for teams. Used when Local Hermes is unavailable. Do not confuse the two.

## Quick start

```bash
cd fintheon
pnpm install
pnpm build --filter @fintheon/hermes

# Terminal 1 — marketing site (http://127.0.0.1:5180)
pnpm dev

# Terminal 2 — auth + onboarding (http://127.0.0.1:3100)
cp apps/web/.env.example apps/web/.env.local
# Add Clerk keys, then:
pnpm dev:web

# Terminal 3 — desktop app
pnpm dev:desktop
```

## Environment

Copy `apps/web/.env.example` to `apps/web/.env.local` and set:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` — enable Google OAuth + email in Clerk dashboard
- `GITHUB_RELEASE_OWNER` / `GITHUB_RELEASE_REPO` — for DMG downloads from GitHub Releases

## Desktop releases

Build and publish signed macOS DMG via GitHub Releases:

```bash
cd apps/desktop
pnpm dist
```

Requires Apple Developer ID credentials in CI (`APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `CSC_LINK`, `CSC_KEY_PASSWORD`).

The desktop app uses `electron-updater` with GitHub Releases as the update provider.

## User funnel

1. Visit marketing site → read copy → click **Get started**
2. Sign up via Google OAuth or email (Clerk)
3. Onboarding screen provisions workspace + offers DMG download
4. Install DMG → Fintheon detects Local Hermes port automatically
5. Agentic layer routes local actions to Local Hermes, cloud actions to Cloud Hermes
