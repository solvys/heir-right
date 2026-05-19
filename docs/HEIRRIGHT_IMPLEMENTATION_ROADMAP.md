# HeirRight S1-S4 Friday Roadmap

Status: implementation-facing roadmap  
Deadline target: Friday, May 22, 2026  
Ownership: TP owns every ORCH and track  
Track cap: 5 tracks max per sprint

## Friday Done

Friday done means a working local/dry-run system:

- live public-source property-first search;
- official-record/title signal capture where feasible;
- raw no-enrichment dossier generation;
- Podio dry-run/free-API path;
- document automation dry-run;
- landing/intake path;
- operator dashboard;
- deployment/handoff blockers listed plainly.

Excluded:

- live outreach sends;
- guaranteed lead volume;
- legal review;
- new counties;
- enrichment for the first milestone;
- AI scoring for Friday unless explicitly re-added.

## Architecture

Core flow:

```text
Live public source search -> SourceFact[] -> Raw Dossier -> Podio dry-run -> Document packet -> Dashboard / Intake
```

Minimum interfaces:

- `SourceFact`: source, raw ID, fetchedAt, county, subject identifiers, fact type, value, confidence, source URL, review flags.
- `RawDossier`: lead summary, property profile, owner profile, title/records events, document payload, CRM sync state, source refs, audit trail.
- `CrmAdapter`: `healthcheck()`, `dryRun(dossier)`, `sync(dossier)`, and `describeRequiredConfig()`.
- `PodioAdapter`: direct/free API first, Browserbase-style browser automation as fallback.
- `DocumentPacket`: internal summary first, then offer/heir/negotiation templates as available.

## S1 - Tuesday, May 19: Live Property + Records Search

Parent issue: `S1-ORCH: HeirRight live public-source search`

Goal: first live property-first test from app sources, no enrichment.

Tracks:

1. `S1-T1: App Scaffold + Source Run Shell`
   Build runnable worker/app shell, run lifecycle, source selection, local dry-run output, and source status logging.

2. `S1-T2: Miami-Dade Property Search Adapter`
   Implement live public property search by address/folio/owner where feasible. Output raw owner/property/parcel facts.

3. `S1-T3: Official Records / Clerk Signal Adapter`
   Capture title/deed/mortgage/lien/adverse-possession signals from public records where feasible. If blocked, produce documented fallback and raw import shape.

4. `S1-T4: Raw Dossier Shell`
   Convert live property + records facts into a no-enrichment dossier shell: owner, property, title events, missing fields, source refs, review flags.

5. `S1-T5: Validation Harness`
   Validate one fresh live lead search, no skip trace, no AI score, no CRM write. Output pass/fail and blocker notes.

Acceptance:

- Fresh live/public-source run executes.
- No-enrichment dossier shell generated.
- Every claim has sourceRef or review flag.
- Blocked source behavior is documented.

## S2 - Wednesday, May 20: Podio + Raw Dossier System

Parent issue: `S2-ORCH: HeirRight raw dossier to Podio`

Goal: make the raw dossier operational and CRM-ready.

Tracks:

1. `S2-T1: Dossier Contract + Storage`
   Finalize `RawDossier`, `SourceFact`, `DossierClaim`, `DossierEvent`, and audit trail types. Persist raw runs, facts, dossiers, and sync attempts.

2. `S2-T2: Podio CRM Adapter`
   Try direct/free Podio API first. Define workspace/app/field mapping. If unavailable, implement browser-automation adapter contract and dry-run payload.

3. `S2-T3: Podio Pipeline Model`
   Map HeirRight workflow into Podio: Marketing, Acquisition, Disposition; lead status; source status; review flags; doc-ready status; next action.

4. `S2-T4: Dossier Narrative Only`
   Generate deterministic or AI-assisted narrative summary only. No scoring by Friday unless later explicitly added.

5. `S2-T5: CRM Dry-Run Validation`
   Produce inspectable Podio payload: lead item, contacts placeholder, title/source notes, tasks, and review blockers. No live write unless API access is confirmed.

Acceptance:

- Raw dossier maps to Podio fields.
- Direct Podio API feasibility is known.
- Browser automation fallback is specified.
- CRM dry-run output is complete.

## S3 - Thursday, May 21: Document Automation

Parent issue: `S3-ORCH: HeirRight document prep automation`

Goal: generate document-ready outputs from raw dossier and CRM fields.

Tracks:

1. `S3-T1: Template Inventory + Field Map`
   Map available document types from HeirRight workflow: offer letter, heir communication, negotiation doc, internal summary, follow-up/status update.

2. `S3-T2: Document Data Contract`
   Define the document payload from dossier/Podio: owner, property, tax/title fields, review flags, offer fields, contact placeholders, missing-input markers.

3. `S3-T3: Internal Summary Generator`
   Generate the internal "Running the play" style summary from raw dossier facts.

4. `S3-T4: PDF/Word Dry-Run Export`
   Produce print-ready HTML/markdown now, with PDF/Word conversion path documented if a conversion dependency is not installed.

5. `S3-T5: Document Review Gate`
   Mark all generated docs as drafts requiring human review. No legal/compliance claims, no auto-send, no external use without approval.

Acceptance:

- At least one internal summary document generates from a live raw dossier.
- Document fields are tied to dossier/CRM fields.
- Missing data remains visible.
- Review gate is explicit.

## S4 - Friday, May 22: Landing, Intake, Deployable Demo, Handoff

Parent issue: `S4-ORCH: HeirRight Friday delivery`

Goal: tie the system together into a Friday-complete runnable delivery.

Tracks:

1. `S4-T1: Landing + Intake`
   Build mobile-first HeirRight intake page with basic SEO-ready structure. Intake creates a local/dry-run lead seed and maps toward Podio.

2. `S4-T2: Operator Dashboard`
   Show source run status, generated dossier, source refs, review flags, document status, and CRM dry-run status.

3. `S4-T3: Deployment Prep`
   Prepare Railway/Vercel or local runnable deployment path. If credentials are missing, ship local runbook plus env checklist and dry-run demo.

4. `S4-T4: End-to-End QA`
   Run fresh public-source lead search through raw dossier, Podio dry-run, document generation, landing/intake, and dashboard.

5. `S4-T5: Handoff Packet`
   Produce implementation-facing runbook: setup, env vars, source limitations, Podio status, known blockers, Friday acceptance checklist, and refinement backlog.

Acceptance:

- One fresh live public-source run works.
- No-enrichment raw dossier renders.
- Podio dry-run/free API path is proven or blocked clearly.
- Internal document output exists.
- Landing/intake and dashboard are runnable.
- Missing external systems are blockers, not fabricated success.

## Current Implementation Status

Implemented in the workspace:

- `@ple/types` includes `SourceFact`, `RawDossier`, `CrmAdapter`, `DocumentPacket`, and related review/audit types.
- `@ple/worker` runs a local dry pipeline and writes `output/latest-run.json`.
- Miami-Dade Property Search and Official Records adapters perform live public app reachability checks and produce review flags.
- `PodioAdapter` produces direct-API config requirements and dry-run payloads.
- Internal summary generator emits markdown and HTML draft outputs.
- `@ple/artifact` serves the latest dry-run result at `http://localhost:4173`.
- `docs/FRIDAY_HANDOFF_RUNBOOK.md` documents setup, outputs, blockers, and Friday acceptance.
