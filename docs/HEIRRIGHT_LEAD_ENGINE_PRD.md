# HeirRight Lead Engine PRD

Status: Friday implementation PRD  
Owner: TP / Solvys  
Client: HeirRight Real Estate  
Target: working local/dry-run system by Friday, May 22, 2026

## Goal

Build the entire HeirRight operational lead system as a Friday-deliverable local/dry-run implementation. The first milestone is a live property-first public-source run without enrichment. The system must produce raw source facts, a no-enrichment dossier shell, a Podio dry-run payload, an internal document summary, and an operator dashboard.

## Source Materials

- `Heir Right (Notion).pdf`
- `HeirRight_Solvys_Project_Agreement_REVISED.pdf` / `.docx`
- `workflow_templates.md`
- `cloud_scraper_prd.md`
- `index.html`
- `leads.json`
- `proposal.html`
- `faces_handoff_prompt.md`

## Friday Done

Friday done means:

- live public-source property-first search runs;
- official-record/title source status is checked where feasible;
- raw no-enrichment dossier renders;
- Podio direct/free API path is represented first, with browser automation fallback;
- document automation dry-run produces an internal summary;
- landing/intake/operator artifact is runnable;
- missing external systems are blockers, not fabricated success.

Explicit exclusions:

- live outreach sends;
- guaranteed lead volume;
- legal review;
- new counties;
- enrichment for the first milestone;
- AI scoring by Friday unless explicitly re-added.

## Data Flow

```text
Live public source search -> SourceFact[] -> RawDossier -> Podio dry-run -> DocumentPacket -> Operator Artifact
```

## Core Interfaces

Implemented in `@ple/types`:

- `SourceFact`: source, raw ID, fetchedAt, county, subject identifiers, fact type, value, confidence, source URL, review flags.
- `RawDossier`: lead summary, property claims, title events, narrative, CRM state, document packet, source refs, audit trail.
- `CrmAdapter`: `healthcheck()`, `dryRun(dossier)`, `sync(dossier)`, `describeRequiredConfig()`.
- `DocumentPacket`: draft review-required markdown and HTML outputs.
- `IntakeSeed`: operator/landing input for public-source runs.

## Sprints

### S1 - Live Property + Records Search

Goal: first property-first public-source test, no enrichment.

Tracks:

- S1-T1: App Scaffold + Source Run Shell
- S1-T2: Miami-Dade Property Search Adapter
- S1-T3: Official Records / Clerk Signal Adapter
- S1-T4: Raw Dossier Shell
- S1-T5: Validation Harness

### S2 - Podio + Raw Dossier System

Goal: make the raw dossier operational and CRM-ready.

Tracks:

- S2-T1: Dossier Contract + Storage
- S2-T2: Podio CRM Adapter
- S2-T3: Podio Pipeline Model
- S2-T4: Dossier Narrative Only
- S2-T5: CRM Dry-Run Validation

### S3 - Document Automation

Goal: generate document-ready outputs from raw dossier and Podio fields.

Tracks:

- S3-T1: Template Inventory + Field Map
- S3-T2: Document Data Contract
- S3-T3: Internal Summary Generator
- S3-T4: PDF/Word Dry-Run Export
- S3-T5: Document Review Gate

### S4 - Landing, Intake, Deployable Demo, Handoff

Goal: connect the Friday delivery surface.

Tracks:

- S4-T1: Landing + Intake
- S4-T2: Operator Dashboard
- S4-T3: Deployment Prep
- S4-T4: End-to-End QA
- S4-T5: Handoff Packet

## Current Implementation

The workspace now contains:

- `probate-lead-engine/apps/worker`: local dry-run pipeline.
- `probate-lead-engine/apps/artifact`: operator artifact/dashboard.
- `probate-lead-engine/packages/types`: shared contracts.
- `docs/HEIRRIGHT_IMPLEMENTATION_ROADMAP.md`: S1-S4 execution roadmap.
- `docs/FRIDAY_HANDOFF_RUNBOOK.md`: setup, outputs, blockers, acceptance.
- `linear/HEIRRIGHT_LINEAR_TICKETS.md`: parent ORCH + child ticket load sheet.
- `sprint-md/`: S1-S4 Solvys briefs.

## Validation

Required commands:

```bash
cd probate-lead-engine
pnpm install
pnpm build
pnpm --filter @ple/worker run:dry -- --address="20611 NW 33rd Pl, Miami Gardens, FL 33056" --owner="Fresh public-source lead"
pnpm --filter @ple/worker test
pnpm --filter @ple/artifact build
pnpm --filter @ple/artifact dev
```

Expected outputs:

- `apps/worker/output/latest-run.json`
- `apps/worker/output/latest-dossier.json`
- `apps/worker/output/podio-dry-run.json`
- `apps/worker/output/internal-summary.md`
- `apps/worker/output/internal-summary.html`
- local dashboard at `http://localhost:4173`

## Known Blockers

- Podio credentials are not configured.
- Browserbase/browser automation credentials are not configured.
- Miami-Dade Property Search and Official Records are reachable, but reliable record extraction still needs endpoint discovery or browser automation.
- Native PDF/Word conversion is represented as HTML/markdown dry-run until conversion dependency is selected.
