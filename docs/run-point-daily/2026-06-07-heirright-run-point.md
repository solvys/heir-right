# HeirRight Run Point - 2026-06-07

Branch: `v2.1.1/heirright-2026-06-07-run-point`
Pushed remote branch: `origin/v2.1.1/heirright-2026-06-07-run-point`
Pushed ref: `origin/v2.1.1/heirright-2026-06-07-run-point`

## Previous-Day Touchups Reviewed

- Read `docs/run-point-daily/2026-06-06-heirright-run-point.md`.
- Read the automation memory for June 4 through June 6.
- Started from `main` at `527e301` after `git fetch --all --prune`.
- Found a carried local artifact-dashboard polish edit in `probate-lead-engine/apps/artifact/src/index.html` before branching. Preserved it on today's fresh unified branch and finished validation there instead of reverting it.
- Rechecked Linear through the connector. Current visible state: `HEI-77` In Progress, `HEI-61` In Progress, `HEI-34` Todo, `HEI-76` Todo, `HEI-85`/`HEI-86` Done with live-readback caveats, and S11 child issues `HEI-71`/`HEI-73`/`HEI-74` still Todo.

## Sprint / Milestone Batches Worked

- S11 - Operator shell foundation hardening.
- S14/S15 - 30-Day volume, export, and readback blocker verification.
- S9/S15 live-readback blocker check only, because Podio/Google runtime config and controlled write approval remain external dependencies.

## Tickets Touched

Read-only Linear context:

- `HEI-34`
- `HEI-61`
- `HEI-71`
- `HEI-73`
- `HEI-74`
- `HEI-76`
- `HEI-77`
- `HEI-85`
- `HEI-86`
- `HEI-90`

No Linear mutations were performed.

## What Was Done

- Added `daily-run.json` support to the artifact build and local artifact server so the dashboard can show the latest daily production ledger next to the lead packet.
- Added a plain-language `30-Day milestone blockers` panel to the operator shell:
  - raw lead count below 200-400 target;
  - qualified lead count below 80-150 target;
  - production county seed file still missing;
  - Podio access, controlled test item, and readback proof still missing;
  - report sections still needing review;
  - Google Workspace target configuration still missing.
- Reworded visible handoff controls from live-sounding "Export" language to prep/handoff language:
  - `Prep export` header action;
  - `CRM handoff` missing-info filter;
  - `handoff: [PREP ONLY]` footer state;
  - `Handoff readiness`, `Handoff result`, and `Handoff blockers` rail sections.
- Removed raw `dry_run`, `staged`, and `Prepare Podio export` wording from the visible handoff rail.
- Fixed the mobile operator-info tooltip overflow found in browser QA.
- Preserved the carried dashboard visual polish already present at run start.

## What Was Not Done

- No production deploy was performed.
- No live Podio item, comment, task, file/link, or readback request was executed.
- No live Google Workspace Drive/Docs/Sheets write or readback was executed.
- No outreach, calls, texts, emails, letters, offers, legal claims, paid-source lookup, or production CRM write was attempted.
- No Linear status changes were made.

## Repo Evidence

- `probate-lead-engine/apps/artifact/build.js`
- `probate-lead-engine/apps/artifact/server.js`
- `probate-lead-engine/apps/artifact/src/index.html`

## Validation Commands / Results

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
node --check apps/artifact/server.js
```

Passed.

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
node - <<'NODE'
const fs = require('fs');
const html = fs.readFileSync('apps/artifact/src/index.html', 'utf8');
const match = html.match(/<script>([\s\S]*)<\/script>/);
if (!match) throw new Error('No inline script found');
new Function(match[1]);
console.log('inline script parsed');
NODE
```

Passed.

```bash
cd /Users/tifos/Documents/Codebases/heir-right
git diff --check
```

Passed.

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm build
```

Passed. Turbo reported 3 successful package builds.

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm --filter @ple/worker test
```

Passed. Validation output reported `ok: true`, run id `run-1780812672604-20611-nw-33rd-pl-miami-gardens-fl-33056`, and 49 facts.

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm --filter @ple/worker run:dry -- --address="20611 NW 33rd Pl, Miami Gardens, FL 33056" --owner="Fresh public-source lead"
```

Passed. Dry run reported:

- `runId: run-1780812677900-20611-nw-33rd-pl-miami-gardens-fl-33056`
- `status: ready_for_review`
- `workflowStatus: review_required`
- `operatorQueueState: manual_review`
- 49 facts

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm --filter @ple/worker run:daily
```

Passed. Daily run reported:

- `id: daily-1780812683073-miami-dade-broward`
- `rawLeadCount: 2`
- `qualifiedLeadCount: 0`
- `reviewLeadCount: 2`
- missed volume reasons: raw count below target, qualified count below target, no production batch seed file

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm --filter @ple/artifact build
```

Passed.

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm --filter @ple/worker export:dry
```

Passed. Google and Podio routes returned `mode: dry_run`, `readbackOk: false`, with live readback skipped blockers.

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm --filter @ple/worker export:podio-live-test
```

Blocked before network write as expected. Result:

- `ok: false`
- `mode: blocked`
- `routeOk: false`
- `readbackOk: false`
- blocker: `Missing Podio export config: PODIO_ACCESS_TOKEN, PODIO_APP_ID, PODIO_FIELD_MAP_JSON or PODIO_APP_ID=24265877`

## Browser / UI QA

Local QA server:

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
AUTH_REQUIRED=false PORT=4173 pnpm --filter @ple/artifact dev
```

In-app Browser desktop pass:

- Page: `http://localhost:4173/`
- Title: `HeirRight Lead Review`
- Top status: `49 evidence items loaded from the latest lead review.`
- Handoff interaction: clicking `Prep export` then `Podio` opened the report rail.
- Handoff rail contained `Handoff readiness`, `Prepare CRM handoff`, and `prep only`.
- Handoff rail did not contain raw `dry_run`, `Prepare Podio export`, or `staged` wording.
- Footer state: `handoff: [PODIO] [PREPARED]`.
- Connection chips: Podio blocked, Google blocked, Web Search dry-run.
- Desktop overflow: `scrollWidth=1280`, `clientWidth=1280`.
- Console warnings/errors: none.

In-app Browser mobile pass:

- Viewport: `390x844`.
- Handoff button remained visible as `Prep export`.
- Milestone blockers remained visible.
- Mobile overflow fixed: `document.scrollWidth=390`, `document.clientWidth=390`, `body.scrollWidth=390`, `body.clientWidth=390`.
- Console warnings/errors: none.

Screenshot note: the Browser screenshot API timed out on full-page desktop capture, so DOM, console, interaction, and viewport checks are the browser proof for this run.

## Solvys Design-Guideline UI Audit

- Changed copy now uses operator-facing handoff/review language instead of live-export or raw runtime language.
- New blocker panel tells a real estate operator what still prevents volume and CRM handoff claims.
- Mobile tooltip overflow was fixed after browser proof showed `scrollWidth=443` at a 390px viewport.
- Existing frosted/gradient styling remains inherited from the current artifact app; this run did not perform a broad visual-system conversion because the daily scope was S11/S14/S15 readiness and visible product stability.

## /solvys-heir-audit

```text
/solvys-heir-audit
Source checked: AGENTS.md, automation memory, June 6 handoff, deal-flow checklist, repo fallback HeirRight_Workflow_Templates_11.15.25.pdf via pypdf, Amaranthe example lead packet via pypdf, S11/S14/S15 briefs, Linear connector state, latest-run/daily-run/export outputs, and desktop/mobile browser QA
Backward: preserved carried artifact-shell polish, added daily-run visibility to the artifact host, surfaced 30-Day volume/qualified/readback blockers in operator language, and changed visible handoff controls so the shell prepares review-only Podio/Google packages without implying live CRM or Google writes
UX pass: aligned
Forward: if Podio/Google inputs arrive, complete controlled live readback; otherwise continue S11 Linear/analytics alignment and the HEI-77 30-Day acceptance packet with blockers explicit
Alignment: aligned with gaps
Required corrections before complete:
- canonical repo path HeirRight Workflow. pdf.pdf is still missing; repo fallback HeirRight_Workflow_Templates_11.15.25.pdf and Amaranthe packet were checked
- live Podio proof still needs PODIO_ACCESS_TOKEN, PODIO_APP_ID=24265877, PODIO_LIVE_WRITE_APPROVED=true, PODIO_TEST_PHONE, PODIO_TEST_EMAIL, PODIO_LEAD_POINT_PROFILE_ID, CSV backup access, and successful item/task/comment/readback
- live Google proof still needs Google Workspace credentials and target Sheet/Drive/Docs configuration
- production county seed inputs still gate 30-Day milestone acceptance and any 200-400 raw / 80-150 qualified volume claim
```

## Remaining Blockers

- S9 remains externally blocked for live completion until Podio runtime config, controlled write approval, CSV backup access, and readback proof are supplied.
- S15 remains repo-complete but externally blocked for live Google/Podio readback.
- HEI-77 / 30-Day acceptance is not claim-ready while latest daily output remains 2 raw, 0 qualified, and no production county seed file.
- Public review-request production routing from June 6 still needs Sam's destination decision.
- The canonical workflow PDF path named by the audit skill is still missing in this repo checkout.

## Decisions Needed From Sam

- Confirm whether Sam/Joshua can supply secure Podio bearer-token runtime config for app `24265877`.
- Approve or decline one clearly labeled `HEIRRIGHT TEST - DO NOT WORK - <timestamp>` Podio lead write.
- Provide test-only phone/email values and a Podio Lead Point profile id for required Podio fields.
- Confirm CSV backup/export access before live Podio validation is treated as milestone evidence.
- Confirm Google Workspace target folder/doc/sheet configuration for live Google readback.
- Pick the production destination for public review requests: approved webhook, CRM handoff, inbox, or no production submit until launch approval.
- Restore `HeirRight Workflow. pdf.pdf` to the canonical repo path or formally accept the repo template PDF as the audit source.

## 11 AM Review Packet

### What was done

- Finished and validated the operator shell's handoff/blocker language.
- Added daily production ledger visibility to the artifact dashboard.
- Made the 30-Day blockers visible in the shell: volume, qualified count, seed file, report gaps, Podio, and Google.
- Proved the shell in a real browser on desktop and mobile.

### What was not done

- No production deploy, CRM write, Google write, outreach, paid source, or legal/compliance action was performed.
- No live Podio or Google readback was possible without external inputs.
- No Linear mutation was made.

### What needs Sam's review

- Whether to supply Podio/Google runtime inputs now or keep those gates blocked.
- Whether the 30-Day blocker panel is acceptable as the review packet's current truth.
- Whether the canonical workflow PDF should be restored.
- Where public review requests should route in production.

### What tomorrow's agent should improve before new work

- If Podio config/approval arrives, run `pnpm build`, then `pnpm --filter @ple/worker export:podio-live-test` once, inspect `apps/worker/output/podio-live-export-result.json`, and verify the Podio item/comment/task/readback manually.
- If Google config arrives, run the Google export path and verify Drive/Docs/Sheets readback before marking S15 live.
- If external inputs do not arrive, keep S9/S15 blocked and focus on `HEI-77` acceptance packet polish plus S11 Linear/analytics alignment.
- Keep every visible operator/client artifact in plain real estate workflow language.

## Agent Briefing

--- Briefing for HeirRight Operator/Agent Cowork ---
Generated: 2026-06-07
Project: HeirRight Probate Lead Engine
Branch: `v2.1.1/heirright-2026-06-07-run-point`

## Identity

HeirRight PLE is a TypeScript probate lead-processing monorepo for turning property/estate seeds into reviewable lead packets, CRM handoff prep, and operator dashboard evidence. The client is a real estate operator, so visible instructions must use deal-flow language, not developer tooling language.

## Stack

- Frontend: vanilla HTML/CSS/JS artifact dashboard under `probate-lead-engine/apps/artifact`.
- Backend: TypeScript worker under `probate-lead-engine/apps/worker`.
- Infrastructure: local Node artifact server, Cloudflare worker path for live runtime, file outputs under `apps/worker/output`.

## Core Rules

- Podio remains CRM/work queue of record unless validated smoke tests disprove it.
- No live outreach, CRM writes, Google writes, paid-source work, legal claims, or offer sends without explicit approval and readback proof.
- Daily run-point gates are `pnpm build`, worker test, exact `run:dry`, and artifact build.
- Use `/solvys-heir-audit` before claiming HeirRight work complete.

## Key Paths

| Path | Purpose |
| --- | --- |
| `probate-lead-engine/apps/artifact/src/index.html` | Operator shell UI |
| `probate-lead-engine/apps/artifact/server.js` | Local dashboard server and protected JSON/API routes |
| `probate-lead-engine/apps/worker/output/latest-run.json` | Latest lead packet |
| `probate-lead-engine/apps/worker/output/daily-run.json` | Latest daily production ledger |
| `docs/run-point-daily/` | Daily run-point handoffs |

## Tools and Protocol Updates

- Artifact dashboard now serves/copies `daily-run.json`.
- Dashboard blocker panel uses `daily-run.json` missed-volume reasons plus Podio/Google/report blockers.
- Handoff controls are prep-only; browser clicks call `/api/exports` with `dryRun: true`.

## Build and Validate

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm build
pnpm --filter @ple/worker test
pnpm --filter @ple/worker run:dry -- --address="20611 NW 33rd Pl, Miami Gardens, FL 33056" --owner="Fresh public-source lead"
pnpm --filter @ple/worker run:daily
pnpm --filter @ple/artifact build
pnpm --filter @ple/worker export:dry
```

## Current Open Issues

- Podio live readback blocked by missing runtime config and approval.
- Google live readback blocked by missing Workspace target config.
- Production volume claims blocked by missing production county seed file.
- Canonical workflow PDF path is missing; fallback template and Amaranthe packet were checked.

--- End Briefing ---

## Closeout State

- S11 operator-shell hardening: implemented and browser-verified.
- S14 daily production truth: verified and visibly blocked for volume claim.
- S15 handoff/readback: dry-run verified; live proof blocked by external config/approval.
- Overall run state: ready for review with external blockers carried forward.
