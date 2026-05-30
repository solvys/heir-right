# HeirRight Run-Point Automation

Status: active setup plan  
Owner: Codex Automation / Claude Cowork  
Project root: `/Users/tifos/Documents/Codebases/heir-right`  
Linear team: HeirRight  
Active Linear project: HeirRight Deal Engine Automation  
Daily trigger: 11:30 AM America/New_York

## Purpose

HeirRight is the first Solvys project where an orchestrated agent runs point across multiple days. The workflow keeps granular Linear tickets for agent execution, but moves human testing to milestone gates so Sam/Joshua only enter the loop when approval, credentials, legal/compliance review, live-write permission, or milestone acceptance is needed.

## Daily Flow

1. Review the previous day's local changes, automation output, Cursor Web PWA sessions, and Linear updates.
2. Run the repo smoke gates before starting new work.
3. Fix broken builds, tests, dry-runs, or UI regressions first.
4. Run a Solvys design-guideline UI audit on changed surfaces.
5. Open Cursor Web PWA through Codex Computer Use.
6. Start parallel Cursor tabs for ready tickets by pasting each `@sprint-md/...` brief.
7. Monitor outputs, capture blockers, and update Linear statuses/comments.
8. Assign human-attention tickets to `sam@solvys.io` only for approvals, credentials, legal/compliance review, live-write approval, or milestone acceptance.

## Milestone Gates

- Project Semi-Automation Setup: supervised/dry-run proof that automation, Linear, Cursor Web PWA, and `/solvys-run-point` are connected.
- Pre-Alaska MVP Testing Handoff: S5-S9 tested together as one usable MVP gate.
- 30-Day Workflow Automation Milestone: workflow automation percentage, completed lead reports, Podio tasks, and draft follow-up scaffolding tested together.
- 90-Day Deal Engine Milestone: document prep automation, Podio-backed deal engine, and reusable shell extraction tested together.

Human testing tickets should not be created after every S5-S11 execution batch.

## Ready Brief Order

- S5: workflow rules, tax/deed depth, source-evidence QA.
- S6: estate-name path, probate/court/family-tree research, paid/manual source governance.
- S7: completed lead report, offer math, CRM field expansion, review gate.
- S8: outreach draft library, follow-up tasks, no-auto-send guard.
- S9: Podio technical validation, CSV safety, Claude Cowork automation artifact, Podio workflow loop, team adoption.
- S10: website redesign after lead engine forward testing begins.
- S11: reusable white-labeled operator shell after HeirRight validates the MVP.

## Smoke Gates

```bash
cd probate-lead-engine
pnpm build
pnpm --filter @ple/worker test
pnpm --filter @ple/worker run:dry -- --address="20611 NW 33rd Pl, Miami Gardens, FL 33056" --owner="Fresh public-source lead"
pnpm --filter @ple/artifact build
```

## Guardrails

- Podio remains the CRM/work queue of record unless smoke tests disprove it.
- Macro and Close are companion/fallback candidates, not the CRM of record.
- Claude Cowork owns the Podio automation artifact; do not reuse the old cloud/cowork label.
- Zapier is only a narrow fallback bridge.
- No live outreach, external sends, production CRM writes, paid/manual source use, or legal/compliance claims without explicit approval.
