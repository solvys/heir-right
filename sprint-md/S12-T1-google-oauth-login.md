# Sprint Brief: S12-T1 -- Google OAuth Login

Branch: `sprint/S12-S13-heirright-2-beta-access-ui`

## Intent

Add the login entry point for the HeirRight 2.0 Beta so operators sign in with Google before reviewing lead packets.

## Scope

- Implement `/auth/login`, `/auth/callback`, `/auth/session`, and `/auth/logout` in the artifact server.
- Allow `heirright.com` by default through `AUTH_ALLOWED_DOMAINS`.
- Allow Solvys reviewers only through `AUTH_ALLOWED_EMAILS` or `SOLVYS_ADMIN_EMAILS`.
- Store a signed, expiring HTTP-only session cookie.

## Out Of Bounds

- User provisioning UI.
- Broad `solvys.io` domain access unless explicitly configured.
- Live Google Drive/Docs/Sheets export, which belongs to S15.

## Validation

```bash
cd probate-lead-engine
pnpm --filter @ple/artifact build
```
