# Sprint Brief: S1-ORCH -- HeirRight Live Public-Source Search

Owner: TP  
Date: Tuesday, May 19, 2026  
Goal: first property-first live public-source test from app sources, no enrichment.

## Tracks

| Issue | Title | Brief |
| --- | --- | --- |
| S1-T1 | App Scaffold + Source Run Shell | `@sprint-md/S1-T1-app-scaffold-source-run-shell.md` |
| S1-T2 | Miami-Dade Property Search Adapter | `@sprint-md/S1-T2-miami-dade-property-search-adapter.md` |
| S1-T3 | Official Records / Clerk Signal Adapter | `@sprint-md/S1-T3-official-records-clerk-signal-adapter.md` |
| S1-T4 | Raw Dossier Shell | `@sprint-md/S1-T4-raw-dossier-shell.md` |
| S1-T5 | Validation Harness | `@sprint-md/S1-T5-validation-harness.md` |

## Acceptance

- Fresh live/public-source run executes.
- No-enrichment dossier shell generated.
- Every claim has sourceRef or review flag.
- Blocked source behavior is documented.

## Validation

```bash
cd probate-lead-engine
pnpm build
pnpm --filter @ple/worker run:dry -- --address="20611 NW 33rd Pl, Miami Gardens, FL 33056" --owner="Fresh public-source lead"
pnpm --filter @ple/worker test
```
