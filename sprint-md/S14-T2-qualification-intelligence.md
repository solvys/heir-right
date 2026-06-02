# Sprint Brief: S14-T2 -- Qualification Intelligence

Branch: `sprint/S14-S15-heirright-2-beta-production-export`

## Intent

Only leads that are real, reviewable, and backed by the workflow evidence should count toward HeirRight fulfillment.

## Scope

- Use workflow status, operator queue state, lead bucket, source flags, enrichment state, and missing report sections as qualification blockers.
- Explain why raw lead volume missed the contract target.
- Keep source-blocked, no-enrichment, duplicate, and placeholder-only records out of qualified counts.

## Out Of Bounds

- Auto-approving paid source lookups.
- Auto-sending outreach.

## Validation

```bash
cd probate-lead-engine
pnpm --filter @ple/worker test
```
