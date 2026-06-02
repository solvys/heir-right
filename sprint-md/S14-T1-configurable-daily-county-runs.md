# Sprint Brief: S14-T1 -- Configurable Daily County Runs

Branch: `sprint/S14-S15-heirright-2-beta-production-export`

## Intent

Give the automation a daily run ledger that can target the next county set, count raw lead output, dedupe repeated records, and preserve failures for review instead of dropping them.

## Scope

- Read county and seed configuration from runtime env.
- Generate a `daily-run.json` ledger with raw count, qualified count, duplicate count, error count, blockers, missed-volume reasons, and dead letters.
- Keep default seeds clearly labeled as review seeds that do not satisfy contract volume.

## Out Of Bounds

- Live outreach.
- Counting unproven placeholder or source-health-only records as qualified leads.

## Validation

```bash
cd probate-lead-engine
pnpm --filter @ple/worker build
pnpm --filter @ple/worker run:daily
```
