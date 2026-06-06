# HeirRight Run Point - 2026-06-06

Branch: `v2.0.1/heirright-2026-06-06-run-point`
Pushed remote branch: `origin/v2.0.1/heirright-2026-06-06-run-point`
Pushed ref: `origin/v2.0.1/heirright-2026-06-06-run-point`

## Previous-Day Touchups Reviewed

- Read `docs/run-point-daily/2026-06-05-heirright-run-point.md`.
- Started from `v2.0.1/heirright-2026-06-05-run-point` at `d16d8ec`.
- Found carried public-site intake changes in `site-v2/` and preserved them on today's fresh unified branch instead of continuing on the June 5 branch.
- Rechecked Linear read-only: project milestones are still active; Pre-Alaska MVP Testing Handoff is 78.23%; 30-Day Workflow Automation Milestone is 48.08%; `HEI-34` remains Todo, `HEI-61` remains In Progress, `HEI-77` remains In Progress, and `HEI-86` / `HEI-90` remain Done with live-readback blockers.

## Sprint / Milestone Lanes Worked

- S10 - Website launch QA / public review-request intake hardening.
- S9/S15 - blocker verification only, because live Podio/Google proof still requires external credentials and explicit approval.

## Tickets Touched

Read-only Linear context:

- `HEI-34`
- `HEI-61`
- `HEI-77`
- `HEI-86`
- `HEI-90`

No Linear mutations were performed.

## What Was Done

- Added the Vercel serverless review-request endpoint at `site-v2/api/review-request.js`.
- Converted the public site form from a local-only prepared state into a guarded submit flow:
  - required name, phone, email, property, and review notes;
  - honeypot field;
  - loading/success/error status states;
  - receipt id returned to the visitor;
  - no texts, emails, offers, outreach, or production CRM writes.
- Hardened the endpoint:
  - accepts parsed, string, buffer, or raw-stream JSON bodies;
  - validates required fields;
  - blocks non-POST methods with `Allow: POST`;
  - optionally forwards to `HEIRRIGHT_DEMO_FORM_WEBHOOK_URL` when configured;
  - logs receipt-level metadata without full phone/email/property/note details.
- Fixed visible launch QA regressions found during browser review:
  - restored intended link/button colors in browser link states;
  - removed desktop hero proof-chip overlap with the CTA row;
  - restored the notes field to full form width;
  - scoped the hidden honeypot input to the form.
- Added `site-v2/.gitignore` so `.vercel` remains local-only.

## What Was Not Done

- No production Vercel deploy was performed.
- No live webhook destination was configured.
- No live Podio item, comment, task, file/link, or readback request was executed.
- No Google Workspace live export/readback was executed.
- No outreach, calls, texts, emails, letters, offers, legal claims, paid-source lookup, or production CRM write was attempted.

## Repo Evidence

- `site-v2/api/review-request.js`
- `site-v2/index.html`
- `site-v2/src/main.ts`
- `site-v2/src/styles.css`
- `site-v2/.gitignore`

## Validation Commands / Results

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm build
```

Passed. Turbo reported 3 successful package builds.

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm --filter @ple/worker test
```

Passed. Validation output reported `ok: true`, run id `run-1780725943115-20611-nw-33rd-pl-miami-gardens-fl-33056`, and 49 facts.

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm --filter @ple/worker run:dry -- --address="20611 NW 33rd Pl, Miami Gardens, FL 33056" --owner="Fresh public-source lead"
```

Passed. Dry run reported:

- `status: ready_for_review`
- `workflowStatus: review_required`
- `operatorQueueState: manual_review`

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm --filter @ple/artifact build
```

Passed.

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm --filter @ple/worker export:dry
```

Passed. Google and Podio routes returned `mode: dry_run`, with live readback skipped blockers.

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm --filter @ple/worker export:podio-live-test
```

Blocked before network write as expected. Result blocker: `Missing Podio export config: PODIO_ACCESS_TOKEN, PODIO_APP_ID, PODIO_FIELD_MAP_JSON or PODIO_APP_ID=24265877`.

```bash
cd /Users/tifos/Documents/Codebases/heir-right/site-v2
pnpm build
```

Passed after the final site changes.

```bash
cd /Users/tifos/Documents/Codebases/heir-right
node -c site-v2/api/review-request.js
git diff --check
```

Passed.

```bash
cd /Users/tifos/Documents/Codebases/heir-right
node --input-type=module <temporary API handler check>
```

Passed. Verified success receipt, missing-property validation, honeypot handling, and method guard.

## Browser / UI QA

Local QA server:

```bash
cd /Users/tifos/Documents/Codebases/heir-right/site-v2
vercel dev --listen 127.0.0.1:4181
```

Browser plugin path:

- Page identity: `http://127.0.0.1:4181/`, title `HeirRight | Inherited Property Review`.
- Not blank: hero and review-request form were present in the DOM.
- Framework overlay: none found.
- Console health: no warnings or errors during page load or submit.
- Interaction proof: mobile form submit returned `Review request received. Confirmation HR-20260606-1E4D1D26.`
- Mobile layout: `390x844`, `scrollWidth=390`, no horizontal overflow, form present.

Screenshot evidence captured outside the repo:

- `/tmp/heirright-site-desktop-final.png`
- `/tmp/heirright-site-mobile-contact-final.png`

Note: the in-app Browser `Page.captureScreenshot` path timed out twice, so screenshot files were captured with the installed Playwright CLI while Browser was used for DOM, console, and interaction proof.

## /solvys-heir-audit

```text
/solvys-heir-audit
Source checked: AGENTS.md, deal-flow checklist, repo fallback HeirRight_Workflow_Templates_11.15.25.pdf via pypdf, Amaranthe example lead packet via pypdf, June 5 handoff, S9/S10/S15 briefs, roadmap, Linear project/issues, worker dry-run outputs, and site browser QA
Backward: preserved June 5 S9/S15 blocker evidence, moved carried S10 site-intake work onto the fresh June 6 branch, added a public review-request receipt endpoint and form submit path, and fixed browser-found launch QA regressions without implying automatic outreach, offers, legal claims, or live CRM writes
UX pass: aligned
Forward: keep S9/S15 live readback blocked until Podio and Google runtime inputs are supplied; next safe local work is milestone acceptance/blocker packet polish or production-launch checklist for the public site
Alignment: aligned with gaps
Required corrections before complete:
- canonical repo path HeirRight Workflow. pdf.pdf is still missing; repo fallback HeirRight_Workflow_Templates_11.15.25.pdf and Amaranthe packet were checked
- live Podio proof still needs PODIO_ACCESS_TOKEN, PODIO_APP_ID=24265877, PODIO_LIVE_WRITE_APPROVED=true, PODIO_TEST_PHONE, PODIO_TEST_EMAIL, PODIO_LEAD_POINT_PROFILE_ID, CSV backup access, and successful item/task/comment readback
- live Google proof still needs Google Workspace credentials and target Sheet/Drive configuration
- production county seed inputs still gate 30-Day milestone acceptance and volume claims
```

## Remaining Blockers

- S9 remains externally blocked for live completion until Podio runtime config, controlled write approval, CSV backup access, and readback proof are supplied.
- S15 remains repo-complete but externally blocked for live Google/Podio readback.
- The public review-request endpoint is locally validated, but production use needs an approved webhook destination or approved storage path.
- The canonical workflow PDF path named by the audit skill is still missing in this repo checkout.
- Production volume proof still needs approved county seed/input feed before any 200-400 raw / 80-150 qualified target can be claimed.

## Decisions Needed From Sam

- Confirm whether Sam/Joshua can supply the secure Podio bearer-token runtime config for app `24265877`.
- Approve or decline one clearly labeled `HEIRRIGHT TEST - DO NOT WORK - <timestamp>` Podio lead write.
- Provide test-only phone/email values and a Podio Lead Point profile id for the required Podio app fields.
- Confirm CSV backup/export access before live Podio validation is treated as milestone evidence.
- Confirm Google Workspace target folder/doc/sheet configuration for live Google readback.
- Pick the production destination for public review requests: approved webhook, CRM handoff, inbox, or no production submit until launch approval.

## 11 AM Review Packet

### What was done

- Carried the dirty public-site intake work onto a fresh June 6 unified branch.
- Added and hardened a public review-request receipt endpoint.
- Proved the public form works locally through Vercel dev and returns a visible receipt.
- Fixed launch QA issues found in screenshots: link/button colors and hero CTA/proof overlap.
- Re-ran the required lead-engine smoke gates and rechecked the S9/S15 blocker commands.

### What was not done

- No production deploy or domain change was made.
- No production webhook/storage destination was configured for public review requests.
- No production Podio or Google write/readback was performed.
- No outreach or legal/compliance action was performed.

### What needs Sam's review

- Whether the public review-request flow should be connected to a real destination before launch.
- Whether to supply Podio runtime config and approve the one controlled Podio test write.
- Whether the missing canonical workflow PDF should be restored to the repo or the audit skill should permanently use the repo template path.

### What tomorrow's agent should improve before new work

- Start from the pushed June 6 branch if reviewing today's site-intake work; create a fresh June 7 branch for new implementation.
- If Podio config/approval arrives, run `pnpm build`, then run `pnpm --filter @ple/worker export:podio-live-test` once, inspect `output/podio-live-export-result.json`, and confirm the item/comment/task/readback in Podio.
- If Podio config does not arrive, keep S9/S15 blocked and focus on a milestone acceptance/blocker packet or the approved public-site production intake destination.
- Keep every visible operator/client artifact in plain real estate workflow language.

## Agent Briefing

- Project: Probate Lead Engine under `probate-lead-engine/`, plus the public HeirRight site under `site-v2/`.
- Branch: `v2.0.1/heirright-2026-06-06-run-point`.
- Current handoff: public site review-request flow is locally validated; S9/S15 remain externally blocked for live Podio/Google readback.
- Key commands: `pnpm build`, `pnpm --filter @ple/worker test`, `pnpm --filter @ple/worker run:dry -- --address="20611 NW 33rd Pl, Miami Gardens, FL 33056" --owner="Fresh public-source lead"`, `pnpm --filter @ple/worker export:dry`, `pnpm --filter @ple/worker export:podio-live-test`, `pnpm --filter @ple/artifact build`, and `cd site-v2 && pnpm build`.
- Use `AGENTS.md` and `/solvys-heir-audit` before claiming HeirRight work complete.

## Closeout State

- S10 public-site intake: implemented and locally validated; production routing decision remains.
- S9: local prep remains validated; live proof remains blocked by external Podio dependencies.
- S15: repo-verified; live readback remains blocked by external Podio/Google dependencies.
- Overall run state: ready for review, with external blockers carried forward.
