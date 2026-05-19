# Sprint Brief: S1-T4 -- Raw Dossier Shell

Owner: TP  
Parent: `S1-ORCH`  
Dependencies: S1-T2, S1-T3

Convert public-source facts into a no-enrichment raw dossier.

Included:

- Property/owner/county/folio claims.
- Title event shell.
- Narrative shell.
- Source refs and audit flags.

Excluded:

- Heir enrichment.
- AI score.
- Offer math.

Acceptance:

- `latest-dossier.json` has a `ready_for_review` or `blocked` status with audit flags.
