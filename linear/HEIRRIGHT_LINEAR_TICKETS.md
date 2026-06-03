# HeirRight Linear Ticket Load Sheet

Team: Solvys / HeirRight implementation
Historical project: HeirRight Friday Delivery
Active project: HeirRight Deal Engine Automation
Phase: Post-Friday milestone execution
Owner for implementation issues: Claude Cowork / Codex Automation
Human blocker assignee: sam@solvys.io
Audience: internal implementation only
Track cap: 5 child tracks per execution batch; S12-S15 2.0 Beta pack uses exactly 2 tracks per sprint and 2 sprints per repo branch.

## Post-Friday Linear Operating Model

- Preserve `HEI-5` through `HEI-28` as completed S1-S4 Friday delivery evidence.
- Use the active `HeirRight Deal Engine Automation` project for S5-S15, run-point setup, and milestone gates.
- Keep granular agent tickets for execution, but create human testing tickets only at milestone gates.
- Assign human-only tickets to `sam@solvys.io` only for credentials, approvals, legal/compliance review, live-write permission, or milestone acceptance.
- Podio remains CRM/work queue of record unless smoke tests disprove it; Macro and Close stay fallback candidates.
- Live outreach remains excluded unless explicitly approved later.

Issue description contract:

- milestone
- brief path
- owner: Claude Cowork, Codex Automation, TP/Sam, or human reviewer
- execution path: Cursor Web PWA, local Codex, manual human, or validation gate
- validation commands
- no-live-outreach guard where relevant

Active milestones:

- Project Semi-Automation Setup: May 27, 2026.
- Pre-Alaska MVP Testing Handoff: June 4, 2026.
- 30-Day Workflow Automation Milestone: June 21, 2026.
- 90-Day Deal Engine Milestone: August 20, 2026.

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

## S2-ORCH: HeirRight raw dossier to CRM adapter

Owner: TP
Due: Wednesday, May 20, 2026
Goal: make the raw dossier operational and CRM-ready through a provider-neutral adapter.

Acceptance:

- Raw dossier maps to provider-neutral CRM fields.
- Macro, Podio, Close, and dry-run provider gaps can be captured without changing the lead engine.
- Browser automation or Albato fallback is specified only for blocked provider actions.
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

## S2-T2: CRM Adapter Contract

Owner: TP
Parent: S2-ORCH
Dependencies: S2-T1

Included scope:

- Provider-neutral CRM config inventory.
- `CrmAdapter` implementation with dry-run, sync, readback, and config discovery.
- Dry-run payload.
- Browserbase-style fallback requirements.

Excluded scope:

- Live provider write without validated workspace/app.

Validation:

```bash
cat apps/worker/output/podio-dry-run.json
```

## S2-T3: CRM Pipeline Model

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
- CRM adapter dry-run path is proven; provider-specific live sync remains blocked until validation.
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
- CRM adapter dry-run.
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
- CRM adapter dry-run.
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

## Post-Friday Planning From Workflow PDF + Zoom Notes

Source: `HeirRight Workflow. pdf.pdf`
Zoom notes: direct Zoom Docs access is blocked by permissions, but Sam supplied pasted notes that are now incorporated. Direct export/share is still needed for provenance.

Pre-Alaska delivery target:

- MVP before June 6, 2026.
- At least 2 days of Joshua testing before departure.
- June 6-20 debugging/refinement window.
- Full forward testing when Joshua returns.

Success targets:

- 30-day: 60%+ front-end qualified lead generation and lead report creation automation, plus text/email workflow scaffolding.
- 90-day: full document prep automation and a functioning deal engine.

Linear milestones:

- Project Semi-Automation Setup: May 27, 2026.
- Pre-Alaska MVP Testing Handoff: June 4, 2026.
- 30-Day Workflow Automation Milestone: June 21, 2026.
- 90-Day Deal Engine Milestone: August 20, 2026.

## R0-ORCH: HeirRight run-point semi-automation setup

Owner: Codex Automation
Milestone: Project Semi-Automation Setup
Goal: establish the daily project point-guard workflow before S5-S11 execution starts.

Child tracks:

- `R0-T1: Claude Cowork terminology and milestone docs`
- `R0-T2: /solvys-run-point skill`
- `R0-T3: Daily HeirRight Run Point automation`
- `R0-HUMAN: Supervised run-point dry run acceptance`

Acceptance:

- No project references to the old cloud/cowork label remain.
- `/solvys-run-point` validates locally.
- Daily automation is active at 11:30 AM America/New_York.
- First run is supervised or dry-run and does not perform live outreach.

## S5-ORCH: HeirRight workflow rules + tax/deed depth

Owner: TP
Goal: encode the real "running the play" qualification rules and configurable lead-quality settings.

Child tracks:

- `S5-T1: Workflow Rule Contract`
- `S5-T2: Tax History Adapter Plan`
- `S5-T3: Deed + OR Book/Page Evidence`
- `S5-T4: Lead Disqualification Queue`
- `S5-T5: Source Evidence QA`

Acceptance:

- Estate-name input is supported in planning.
- Company-owner and recent-sale disqualification rules are explicit.
- Tax/deed/adverse-possession facts have source refs or review flags.
- Lead-quality toggles are planned for estate/property match, probate/court signal, stuck-estate timing, mailing-address mismatch, unpaid-tax friction, title/deed friction, code-enforcement/property-friction signals, and low-signal generic-pull suppression.
- Paid/manual sources remain blocked until approved.

## S6-ORCH: HeirRight probate + heirship research

Owner: TP
Goal: turn court/probate/family-tree work into an auditable research queue.

Child tracks:

- `S6-T1: Estate-Name Search Path`
- `S6-T2: Probate/Civil/Family Docket Model`
- `S6-T3: Marriage + Death Indicator Checks`
- `S6-T4: Family Tree Hypothesis`
- `S6-T5: Paid/Manual Source Governance`

Acceptance:

- Probate/civil/family docket facts are modeled separately from legal conclusions.
- Affidavit-of-heirs, marriage, obituary, DOB/DOD, incarceration, and family tree evidence can be tracked.
- IDI, Intelius, Ancestry, ForeWarn, VitalChek, PI requests, door knocks, and code-enforcement workflows are approval-gated.

## S7-ORCH: HeirRight completed lead report + offer math

Owner: TP
Goal: generate the lead report format operators use before outreach.

Child tracks:

- `S7-T1: Completed Lead Report Schema`
- `S7-T2: Offer/Profit Inputs`
- `S7-T3: Report Renderer`
- `S7-T4: CRM Field Expansion`
- `S7-T5: Human Review Gate`

Acceptance:

- Report includes backstory, workflow steps, source links, missing data, family tree hypothesis, and contact placeholders.
- Report includes an explainable lead-quality profile with enabled signals, missing signals, reason codes, and review flags.
- Offer/profit inputs are represented: as-is value, taxes, liens, mortgages, selling/probate/partition costs, equity per heir, offer, profit, and minimum net profit.
- Report remains internal until reviewed.

## S8-ORCH: HeirRight outreach draft library + follow-up workflow

Owner: TP
Goal: preserve scripts and follow-up rhythms without live outreach automation.

Child tracks:

- `S8-T1: Script Inventory`
- `S8-T2: Compliance Review State`
- `S8-T3: Follow-Up Task Model`
- `S8-T4: Outreach-Ready Criteria`
- `S8-T5: No-Auto-Send Guard`

Acceptance:

- Calls, texts, emails, neighbor scripts, relative scripts, owner scripts, closing calls, and offer letters are draft assets.
- No automated external sends are allowed.
- Follow-up cadence and Joshua escalation are represented as tasks.

## S9-ORCH: HeirRight Podio Claude Cowork automation + sales queue validation

Owner: TP
Goal: validate Podio as the leading CRM path, prove the Claude Cowork automation artifact, and keep Macro/Close as fallback options only if Podio fails.

Child tracks:

- `S9-T1: Podio Technical + MCP Validation`
- `S9-T2: CSV Migration Dry Run`
- `S9-T3: Claude Cowork Podio Automation Artifact`
- `S9-T4: Podio Workflow Loop Test`
- `S9-T5: Team Adoption Gate`

Acceptance:

- Podio API, hooks/webhooks, MCP feasibility, app/field structure, and readback are validated with a real account/invite.
- Claude Cowork artifact can create/update Podio items, tasks, comments, files/links, and status transitions through controlled automation.
- Zapier is not required for the core automation loop.
- CSV export/import proves migration without risking original Podio/Sheets data.
- Macro and Close remain fallback options if Podio fails automation/readback/team-fit gates.

## S10-ORCH: HeirRight website redesign

Owner: TP
Goal: redesign the public site after lead engine delivery enters forward testing.

Child tracks:

- `S10-T1: Website Content Intake`
- `S10-T2: Visual Direction Prototypes`
- `S10-T3: Copy/Layout Drafts`
- `S10-T4: Build + Polish`
- `S10-T5: Launch QA`

Acceptance:

- Website work starts after lead engine delivery, not before the core MVP.
- Joshua receives multiple artistic directions and 2-3 copy/layout options.
- Final site is mobile-first, polished, and launch-checked.

## S11-ORCH: White-labeled operator shell foundation

Owner: TP
Goal: extract a reusable Solvys operator shell pattern after HeirRight validates the MVP.

Child tracks:

- `S11-T1: Project Shell Contract`
- `S11-T2: HeirRight Shell MVP Pattern`
- `S11-T3: Solvys Admin Analytics Hub`
- `S11-T4: Local Runtime + Linear Sync`
- `S11-T5: Extraction + Solvys-1/Fintheon Hooks`

Acceptance:

- Project shells support client-specific navigation rather than generic permanent panes.
- HeirRight Settings include lead-quality toggles for source-signal weighting and thresholds, without approving live outreach or promising lead volume.
- Bottom composer remains the command surface.
- Agent visibility is a lightweight drawer.
- Local runtime supports build/test/dry-run/artifact preview.
- Linear remains the source of truth.
- OpenPanel/PostHog analytics and monitoring path is represented behind a provider-agnostic event contract.
- Solvys admin dashboard requirements cover cross-project analytics and deeper Solvys-1 control.
- HeirRight MVP validation gates generic shell extraction.
