# Sprint Brief: S15-T2 -- Podio Export + Readback

Branch: `sprint/S14-S15-heirright-2-beta-production-export`

## Intent

Create the Podio handoff item and prove it can be read back before the system treats the export as complete.

## Scope

- Map report fields into the configured Podio app.
- Create or prepare the item payload.
- Add the source-note handoff comment.
- Create the manual review task.
- Read back the item and surface blockers when any step fails.

## Out Of Bounds

- Marking S9 complete before live Podio controlled write/readback is proven.
- Auto-sending calls, texts, email, or letters.

## Validation

```bash
cd probate-lead-engine
pnpm --filter @ple/worker test
```
