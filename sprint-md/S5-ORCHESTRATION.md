# Sprint Brief: S5-ORCH -- HeirRight Workflow Rules + Tax/Deed Depth

Owner: TP
Date: Saturday, May 23 - Monday, May 25, 2026
Goal: encode the real "running the play" qualification rules and configurable lead-quality settings behind the dry-run lead engine.

## Scope Rule

This sprint excludes decisions that must be answered during initial validation: live CRM choice, paid-source approvals, compliance approval, and live outreach.

## Tracks

| Issue | Title | Brief |
| --- | --- | --- |
| S5-T1 | Workflow Rule Contract | `@sprint-md/S5-T1-workflow-rule-contract.md` |
| S5-T2 | Tax History Adapter Plan | `@sprint-md/S5-T2-tax-history-adapter-plan.md` |
| S5-T3 | Deed + OR Book/Page Evidence | `@sprint-md/S5-T3-deed-or-book-page-evidence.md` |
| S5-T4 | Lead Disqualification Queue | `@sprint-md/S5-T4-lead-disqualification-queue.md` |
| S5-T5 | Source Evidence QA | `@sprint-md/S5-T5-source-evidence-qa.md` |

## Acceptance

- Estate-name input is supported as a first-class planning/build path.
- Company-owner and recent-sale disqualification rules are explicit.
- Tax/deed/adverse-possession facts have source refs or review flags.
- Lead-quality toggles are defined for source-signal promotion so generic probate/data pulls remain seeds until multiple quality signals converge.
- Paid/manual sources remain blocked until approved.
