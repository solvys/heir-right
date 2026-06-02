# Sprint Brief: S13-T2 -- HeirRight Report Shape Polish

Branch: `sprint/S12-S13-heirright-2-beta-access-ui`

## Intent

Bring the report preview closer to the client examples while keeping unknown facts visible as review work.

## Scope

- Add client report snapshot fields to generated reports.
- Show date added, property, owner/estate, contact placeholders, offer status, and missing sections in the rail.
- Keep backstory, family tree, offer math, and source links visible for operator review.

## Out Of Bounds

- Fabricating heirs, phones, emails, dates, or tax values.
- Live outreach or external-use approval.

## Validation

```bash
cd probate-lead-engine
pnpm build
pnpm --filter @ple/worker test
```
