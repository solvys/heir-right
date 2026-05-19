# Sprint Brief: S1-T5 -- Validation Harness

Owner: TP  
Parent: `S1-ORCH`  
Dependencies: S1-T1, S1-T2, S1-T3, S1-T4

Validate one live/public-source dry-run without enrichment, scoring, CRM live write, or outreach.

Included:

- Output existence checks.
- No-enrichment guard.
- CRM/document dry-run existence checks.
- SourceRef/review-flag checks.

Excluded:

- Live source success claims when extraction is blocked.

Acceptance:

- `pnpm --filter @ple/worker test` passes.
