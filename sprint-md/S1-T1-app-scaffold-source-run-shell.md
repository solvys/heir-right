# Sprint Brief: S1-T1 -- App Scaffold + Source Run Shell

Owner: TP  
Parent: `S1-ORCH`  
Dependencies: none

Build the runnable worker/app shell, run lifecycle, source selection, local dry-run output, and source status logging.

Included:

- `@ple/worker` package.
- CLI dry-run entrypoint.
- Local output writer.
- Intake seed support.

Excluded:

- Enrichment.
- AI scoring.
- CRM live writes.
- Live outreach sends.

Acceptance:

- `pnpm --filter @ple/worker run:dry` writes output JSON and document files.
