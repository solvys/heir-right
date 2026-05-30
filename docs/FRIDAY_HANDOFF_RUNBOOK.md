# HeirRight Friday Handoff Runbook

Status: implementation-facing dry-run runbook.

## What Friday Done Means

Friday done is a working local/dry-run system unless external credentials arrive. It must show:

- public-source property-first run;
- official-records/title source availability and blocker flags;
- no-enrichment raw dossier;
- CRM adapter dry-run payload and provider config requirements;
- internal summary document packet;
- operator artifact dashboard;
- explicit blockers for missing credentials and source extraction gaps.

## Local Commands

```bash
cd probate-lead-engine
pnpm install
pnpm build
pnpm --filter @ple/worker run:dry -- --address="20611 NW 33rd Pl, Miami Gardens, FL 33056" --owner="Fresh public-source lead"
pnpm --filter @ple/worker test
pnpm --filter @ple/artifact build
pnpm --filter @ple/artifact dev
```

Open `http://localhost:4173` after the artifact server starts.

## Cloudflare Worker Deploy

The dry-run pipeline also has a Cloudflare Worker HTTP surface. It does not persist files in the Worker runtime; it returns the same run, dossier, CRM dry-run, and summary payloads directly from HTTP endpoints.

Live Worker URL:

- `https://heirright-probate-lead-engine.sam-e7a.workers.dev`

```bash
cd probate-lead-engine
pnpm install
pnpm build
pnpm --filter @ple/worker dev:cloudflare
pnpm --filter @ple/worker deploy:cloudflare
```

Current deploy auth:

- This machine is authenticated through Wrangler OAuth for `sam@solvys.io`.
- Non-interactive CI deploys should use `CLOUDFLARE_API_TOKEN` plus `CLOUDFLARE_ACCOUNT_ID`.

Useful Worker paths:

- `/health`
- `/dry-run?address=20611%20NW%2033rd%20Pl,%20Miami%20Gardens,%20FL%2033056&owner=Fresh%20public-source%20lead`
- `/latest-run.json`
- `/latest-dossier.json`
- `/podio-dry-run.json`
- `/internal-summary.md`
- `/internal-summary.html`

## Outputs

Worker dry-run outputs are written under:

- `probate-lead-engine/apps/worker/output/latest-run.json`
- `probate-lead-engine/apps/worker/output/latest-dossier.json`
- `probate-lead-engine/apps/worker/output/podio-dry-run.json`
- `probate-lead-engine/apps/worker/output/internal-summary.md`
- `probate-lead-engine/apps/worker/output/internal-summary.html`

## Current Blockers

- CI/non-interactive Cloudflare deploy still needs a scoped `CLOUDFLARE_API_TOKEN`.
- Podio API credentials are not configured.
- Podio integration viability still needs account-level validation, but heavy custom Podio work should wait until Podio proves automation-friendly.
- Macro account/admin access is not configured yet.
- Podio is the leading CRM path if API/MCP/hooks/readback smoke tests pass.
- Macro and Close remain fallback candidates if Podio fails technical validation.
- Browserbase fallback credentials are not configured.
- Zoom meeting notes link is not readable from this session; Zoom Docs returned permission/authorization errors. User-supplied pasted notes are incorporated, but direct export/share is still needed for provenance.
- Public Miami-Dade apps are reachable, but server-side result extraction still needs endpoint discovery or browser automation.
- Workflow PDF introduces paid/manual sources that need explicit approval before automation or storage: IDI, Intelius, Ancestry, ForeWarn, VitalChek, PI requests, code enforcement, door knocks, neighbor research, and outreach scripts.
- Enrichment is intentionally not part of the first milestone.
- No live outreach sends are implemented.
- No legal review or lead-volume guarantees are included.

## Friday Acceptance Checklist

- Run generates `SourceFact[]`.
- Run generates a no-enrichment raw dossier.
- Dossier has sourceRefs or review flags for every major claim.
- CRM dry-run payload is present.
- Internal summary document packet is present.
- Operator artifact displays latest run.
- Missing external systems are listed as blockers.

## Post-Friday Planning Notes

`HeirRight Workflow. pdf.pdf` confirms that the next roadmap should move from a narrow public-source dry run into the real operator workflow:

- workflow rule engine for individual-owner qualification, company-owner disqualification, recent-sale disqualification, adverse possession, unpaid taxes, and missing source evidence;
- estate-name-first search path;
- tax/deed/OR book-page depth;
- probate, civil, family, affidavit-of-heirs, and marriage-license research;
- family tree hypothesis and paid/manual source governance;
- completed lead report generation with offer/profit math;
- draft-only outreach script library with compliance review gates.

The pasted Zoom onboarding notes add:

- MVP before June 6, 2026 with at least 2 testing days before Joshua leaves for Alaska;
- June 6-20 debugging/refinement window while Joshua is unavailable;
- 30-day target of 60%+ front-end qualified lead/report automation and text/email workflow scaffolding;
- 90-day target of full document prep automation and a functioning deal engine;
- CRM validation path: adapter-first, Podio API/MCP/hooks/readback validation, Claude Cowork automation artifact, Macro/Close fallback only if Podio fails;
- website redesign after lead engine delivery and forward testing starts.

Post-Friday execution now runs through milestone gates instead of sprint-by-sprint human review:

- Project Semi-Automation Setup proves the daily Codex Automation, Cursor Web PWA handoff, Linear updates, and `/solvys-run-point` skill.
- Pre-Alaska MVP Testing Handoff tests S5-S9 together.
- 30-Day Workflow Automation Milestone tests the automation percentage, completed lead reports, Podio task flow, and draft outreach scaffolding together.
- 90-Day Deal Engine Milestone tests document prep automation, the Podio-backed deal engine, and reusable shell extraction together.
- Human-only tickets go to `sam@solvys.io` only for credentials, approvals, legal/compliance review, live-write approval, or milestone acceptance.
