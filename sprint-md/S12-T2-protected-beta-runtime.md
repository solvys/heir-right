# Sprint Brief: S12-T2 -- Protected Beta Runtime

Branch: `sprint/S12-S13-heirright-2-beta-access-ui`

## Intent

Protect the beta app and backend run/report routes so lead data is visible only to approved users or internal automation.

## Scope

- Gate the artifact HTML and `/latest-run.json` behind the signed session.
- Add worker-side auth checks for dry-run and latest report routes.
- Permit backend automation with `HEIRRIGHT_API_TOKEN` bearer auth.
- Show the signed-in user in the header.

## Out Of Bounds

- Full multi-tenant account settings.
- Paid-source credentials or client CRM credentials.
- Disabling the no-auto-send guard.

## Validation

```bash
cd probate-lead-engine
pnpm build
pnpm --filter @ple/worker test
pnpm --filter @ple/artifact build
```
