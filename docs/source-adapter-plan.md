# HeirRight Source Adapter Plan

Status: Friday implementation v1  
Purpose: define how planned public sources feed the raw dossier engine.

## Adapter Output Principle

Adapters return normalized `SourceFact[]`. They do not decide CRM state, score, outreach strategy, or legal interpretation. The dossier builder converts facts into claims, title events, review flags, document fields, and Podio dry-run payloads.

Minimum adapter output:

```ts
type SourceFact = {
  id: string;
  runId: string;
  source: SourceKey;
  rawId: string;
  fetchedAt: string;
  county: string;
  subject: {
    ownerName?: string;
    propertyAddress?: string;
    parcelId?: string;
    caseNumber?: string;
    county?: string;
  };
  factType: FactType;
  value: unknown;
  confidence: number;
  sourceUrl?: string;
  reviewFlags: ReviewFlag[];
};
```

## Friday Source Scope

| Source | Friday posture | Primary inputs | Output facts | Blocker behavior |
| --- | --- | --- | --- | --- |
| Miami-Dade Property Appraiser | Live app reachability + public search URL; structured extraction where feasible | address, owner, folio | source status, search URL, seed address/owner/folio/county facts | `SOURCE_HEALTH_ONLY`, `MISSING_PROPERTY_FACT`, source refs |
| Miami-Dade Official Records / Clerk | Live app reachability + title-signal placeholder; browser/API extraction next | owner, address, folio | official-record status, title-signal review event | `MISSING_TITLE_FACT`, source refs |
| Landing/intake | Local dry-run seed | address, owner, county, folio | intake seed fact | missing fields become review flags |
| Podio | Dry-run only unless config exists | raw dossier | CRM payload fact | missing credentials block live sync |
| Document packet | Draft internal summary first | raw dossier | document output fact | `HUMAN_REVIEW_REQUIRED` |

## SourceRef Rule

Every dossier claim must have at least one source ref or a review flag explaining why it is not source-confirmed.

Example:

```json
{
  "source": "property_appraiser",
  "rawId": "property-search:20611-nw-33rd-pl-miami-gardens-fl-33056:status",
  "fetchedAt": "2026-05-19T00:00:00.000Z"
}
```

## Stop Conditions

Stop and report a blocker instead of forcing source extraction when:

- a source requires login or authenticated access without approval;
- a source presents CAPTCHA or anti-automation controls;
- a source returns repeated 403/429 responses;
- the public app is reachable but structured records require endpoint discovery;
- fetching would violate a known source restriction.

## Degradation Rules

- One blocked source must not fail the whole run.
- Missing facts create visible `reviewFlags`.
- Friday mode must not synthesize tax, probate, death, lien, or heirship facts.
- Friday mode must not use enrichment or skip trace.
- Friday mode can produce source-health facts while marking unverified property/title claims for review.

## Implementation Order

1. Property-first live public-source run shell.
2. Miami-Dade Property Appraiser adapter.
3. Miami-Dade Official Records / Clerk adapter.
4. Raw dossier builder with source-ref discipline.
5. Podio dry-run payload.
6. Internal summary document packet.
7. Dashboard/intake and Friday handoff.
