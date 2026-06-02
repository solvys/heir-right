# Sprint Brief: S12-ORCH -- Organization Access + Beta Runtime Gate

Owner: TP
Beta phase: Pre-Release
Branch: `sprint/S12-S13-heirright-2-beta-access-ui`
Project: HeirRight Deal Engine Automation

## Goal

Require approved Google sign-in before the beta app or lead packet data can be viewed. HeirRight operators use `heirright.com` Google accounts; Solvys reviewers use explicitly configured admin emails.

## Tracks

| Track | Title | Brief |
| --- | --- | --- |
| S12-T1 | Google OAuth Login | `@sprint-md/S12-T1-google-oauth-login.md` |
| S12-T2 | Protected Beta Runtime | `@sprint-md/S12-T2-protected-beta-runtime.md` |

## Acceptance

- Allowed HeirRight and configured Solvys users can enter.
- Non-allowed Google accounts are rejected.
- Lead packet JSON and report data are not exposed without a valid session or internal API token.
- Missing OAuth configuration shows a clear blocker instead of exposing data.
