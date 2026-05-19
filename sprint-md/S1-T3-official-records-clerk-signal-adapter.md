# Sprint Brief: S1-T3 -- Official Records / Clerk Signal Adapter

Owner: TP  
Parent: `S1-ORCH`  
Dependencies: S1-T1

Capture Official Records source availability and title-signal placeholders where server-side extraction is not reliable yet.

Included:

- Official Records public app healthcheck.
- Title signal placeholder facts.
- Review flags for missing extracted title claims.
- Browser/API fallback note.

Excluded:

- Authenticated scraping.
- Guaranteed title extraction without endpoint/browser validation.

Acceptance:

- Source facts include `official_records` refs and title review flags.
