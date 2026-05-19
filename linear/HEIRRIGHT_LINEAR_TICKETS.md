# HeirRight Linear Ticket Load Sheet

Team: Solvys / HeirRight implementation  
Project: HeirRight Friday Delivery  
Phase: Pre-Release  
Owner for all issues: TP  
Audience: internal implementation only  
Track cap: 5 child tracks per sprint

## S1-ORCH: HeirRight live public-source search

Owner: TP  
Due: Tuesday, May 19, 2026  
Goal: first live property-first test from app sources, no enrichment.

Acceptance:

- Fresh live/public-source run executes.
- No-enrichment dossier shell generated.
- Every claim has sourceRef or review flag.
- Blocked source behavior is documented.

## S1-T1: App Scaffold + Source Run Shell

Owner: TP  
Parent: S1-ORCH  
Dependencies: none  

Included scope:

- Worker/app shell.
- Run lifecycle.
- Source selection.
- Local dry-run output.
- Source status logging.

Excluded scope:

- Enrichment.
- AI scoring.
- CRM live writes.
- Live outreach sends.

Validation:

```bash
pnpm --filter @ple/worker run:dry
```

## S1-T2: Miami-Dade Property Search Adapter

Owner: TP  
Parent: S1-ORCH  
Dependencies: S1-T1  

Included scope:

- Live public Property Search reachability.
- Search URL/source status facts.
- Address/owner/folio seed facts.
- Review flags when server-side extraction is not reliable.

Excluded scope:

- Skip trace.
- Paid proxying.
- False verified property claims.

Validation:

```bash
pnpm --filter @ple/worker test
```

## S1-T3: Official Records / Clerk Signal Adapter

Owner: TP  
Parent: S1-ORCH  
Dependencies: S1-T1  

Included scope:

- Live Official Records app reachability.
- Title signal placeholder facts.
- Review flags for missing extracted title claims.
- Browser/API fallback notes.

Excluded scope:

- Authenticated scraping.
- Guaranteed title extraction without endpoint/browser validation.

Validation:

```bash
pnpm --filter @ple/worker test
```

## S1-T4: Raw Dossier Shell

Owner: TP  
Parent: S1-ORCH  
Dependencies: S1-T2, S1-T3  

Included scope:

- No-enrichment raw dossier.
- Property/owner/county/folio claims.
- Title event shell.
- Narrative shell.
- Source refs and audit flags.

Excluded scope:

- Heir enrichment.
- AI score.
- Offer math.

Validation:

```bash
pnpm --filter @ple/worker run:dry
```

## S1-T5: Validation Harness

Owner: TP  
Parent: S1-ORCH  
Dependencies: S1-T1, S1-T2, S1-T3, S1-T4  

Included scope:

- Dry-run validation command.
- Output existence checks.
- No-enrichment guard.
- CRM/document dry-run existence checks.

Excluded scope:

- Live source success claims when source extraction is blocked.

Validation:

```bash
pnpm --filter @ple/worker test
```

## S2-ORCH: HeirRight raw dossier to Podio

Owner: TP  
Due: Wednesday, May 20, 2026  
Goal: make the raw dossier operational and CRM-ready.

Acceptance:

- Raw dossier maps to Podio fields.
- Direct Podio API feasibility is known.
- Browser automation fallback is specified.
- CRM dry-run output is complete.

## S2-T1: Dossier Contract + Storage

Owner: TP  
Parent: S2-ORCH  
Dependencies: S1  

Included scope:

- `RawDossier`, `SourceFact`, `DossierClaim`, `DossierEvent`.
- Audit trail types.
- Local output persistence for raw runs, dossiers, Podio payloads.

Validation:

```bash
pnpm build
```

## S2-T2: Podio CRM Adapter

Owner: TP  
Parent: S2-ORCH  
Dependencies: S2-T1  

Included scope:

- Podio direct/free API config inventory.
- `CrmAdapter` implementation.
- Dry-run payload.
- Browserbase-style fallback requirements.

Excluded scope:

- Live Podio write without validated workspace/app.

Validation:

```bash
cat apps/worker/output/podio-dry-run.json
```

## S2-T3: Podio Pipeline Model

Owner: TP  
Parent: S2-ORCH  
Dependencies: S2-T2  

Included scope:

- Marketing / Acquisition / Disposition.
- Lead status.
- Source status.
- Review flags.
- Doc-ready status.
- Next action.

Validation:

```bash
rg -n "Marketing|Acquisition|Disposition|review_flags|next_best_action" apps/worker/output/podio-dry-run.json
```

## S2-T4: Dossier Narrative Only

Owner: TP  
Parent: S2-ORCH  
Dependencies: S2-T1  

Included scope:

- Deterministic narrative.
- Missing-data notes.
- Next best action.

Excluded scope:

- AI score.
- Lead ranking.

Validation:

```bash
rg -n "Raw no-enrichment dossier|Next Best Action" apps/worker/output/internal-summary.md
```

## S2-T5: CRM Dry-Run Validation

Owner: TP  
Parent: S2-ORCH  
Dependencies: S2-T2, S2-T3, S2-T4  

Included scope:

- Inspectable Podio payload.
- Required config listed.
- Browser automation fallback specified.

Validation:

```bash
pnpm --filter @ple/worker test
```

## S3-ORCH: HeirRight document prep automation

Owner: TP  
Due: Thursday, May 21, 2026  
Goal: generate document-ready outputs from raw dossier and CRM fields.

Acceptance:

- At least one internal summary document generates from a live raw dossier.
- Document fields are tied to dossier/CRM fields.
- Missing data remains visible.
- Review gate is explicit.

## S3-T1: Template Inventory + Field Map

Owner: TP  
Parent: S3-ORCH  
Dependencies: S2  

Included scope:

- Internal summary.
- Offer letter placeholder.
- Heir communication placeholder.
- Negotiation/status update placeholder.

Validation:

```bash
rg -n "Internal Summary|offer|heir|status" docs/FRIDAY_HANDOFF_RUNBOOK.md apps/worker/src/documents/internal-summary.ts
```

## S3-T2: Document Data Contract

Owner: TP  
Parent: S3-ORCH  
Dependencies: S3-T1  

Included scope:

- `DocumentPacket`.
- Markdown and HTML formats.
- Review flags.

Validation:

```bash
pnpm --filter @ple/types build
```

## S3-T3: Internal Summary Generator

Owner: TP  
Parent: S3-ORCH  
Dependencies: S3-T2  

Included scope:

- "Running the play" style internal summary.
- Property, findings, title signals, next action, flags, sources.

Validation:

```bash
cat apps/worker/output/internal-summary.md
```

## S3-T4: PDF/Word Dry-Run Export

Owner: TP  
Parent: S3-ORCH  
Dependencies: S3-T3  

Included scope:

- HTML document output.
- Markdown document output.
- Conversion path documented.

Excluded scope:

- Claiming native PDF/Word conversion if dependency is missing.

Validation:

```bash
test -f apps/worker/output/internal-summary.html
```

## S3-T5: Document Review Gate

Owner: TP  
Parent: S3-ORCH  
Dependencies: S3-T3  

Included scope:

- Draft status.
- Human review required.
- No legal/compliance claims.
- No auto-send.

Validation:

```bash
rg -n "Draft - human review required|HUMAN_REVIEW_REQUIRED" apps/worker/output/internal-summary.md apps/worker/output/latest-dossier.json
```

## S4-ORCH: HeirRight Friday delivery

Owner: TP  
Due: Friday, May 22, 2026  
Goal: tie the system together into a Friday-complete runnable delivery.

Acceptance:

- One fresh live public-source run works.
- No-enrichment raw dossier renders.
- Podio dry-run/free API path is proven or blocked clearly.
- Internal document output exists.
- Landing/intake and dashboard are runnable.
- Missing external systems are blockers, not fabricated success.

## S4-T1: Landing + Intake

Owner: TP  
Parent: S4-ORCH  
Dependencies: S2  

Included scope:

- Operator-facing intake seed path.
- Local/dry-run lead seed.
- Maps toward Podio payload.

Validation:

```bash
pnpm --filter @ple/artifact build
```

## S4-T2: Operator Dashboard

Owner: TP  
Parent: S4-ORCH  
Dependencies: S1-S3  

Included scope:

- Latest run status.
- Dossier.
- Source facts.
- Review flags.
- Podio dry-run.
- Document packet.

Validation:

```bash
pnpm --filter @ple/artifact dev
```

## S4-T3: Deployment Prep

Owner: TP  
Parent: S4-ORCH  
Dependencies: S4-T2  

Included scope:

- Local runbook.
- Env checklist.
- Railway/Vercel credential blockers.

Validation:

```bash
cat docs/FRIDAY_HANDOFF_RUNBOOK.md
```

## S4-T4: End-to-End QA

Owner: TP  
Parent: S4-ORCH  
Dependencies: S1-S4  

Included scope:

- Source run.
- Raw dossier.
- Podio dry-run.
- Document packet.
- Artifact dashboard.

Validation:

```bash
pnpm build && pnpm --filter @ple/worker test && pnpm --filter @ple/artifact build
```

## S4-T5: Handoff Packet

Owner: TP  
Parent: S4-ORCH  
Dependencies: S4-T4  

Included scope:

- Setup.
- Env vars.
- Source limitations.
- Podio status.
- Known blockers.
- Friday acceptance checklist.
- Refinement backlog.

Validation:

```bash
rg -n "Current Blockers|Friday Acceptance Checklist|Podio" docs/FRIDAY_HANDOFF_RUNBOOK.md
```
