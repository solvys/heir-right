# Sprint Brief: S1-T2 -- Miami-Dade Property Search Adapter

Owner: TP  
Parent: `S1-ORCH`  
Dependencies: S1-T1

Implement live public Property Search reachability and source facts without pretending the SPA has been parsed.

Included:

- Miami-Dade Property Search healthcheck.
- Search URL/source status facts.
- Address/owner/folio seed facts.
- Review flags for missing verified facts.

Excluded:

- Skip trace.
- Paid proxying.
- False verified property claims.

Acceptance:

- Source facts include `property_appraiser` refs and no-enrichment review flags.
