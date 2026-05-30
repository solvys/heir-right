# Sprint Brief: S5-T1 -- Workflow Rule Contract

Owner: TP
Parent: S5-ORCH
Dependencies: S1-S4

## Goal

Define the deterministic workflow-rule contract for owner qualification, lead-quality settings, stop/continue states, and review-required states.

## Included Scope

- Individual owner continue state.
- Company-owner disqualification/review state.
- Recent sale within 5 years disqualification/review state.
- Adverse possession review flag.
- Missing source evidence review flag.
- Configurable lead-quality toggles for estate/property match, probate/court signal, stuck-estate timing, mailing-address mismatch, unpaid-tax friction, title/deed friction, code-enforcement/property-friction signals, and generic-pull suppression.
- Rule output shape for dashboard, report, and CRM payloads.

## Excluded Scope

- Final legal interpretation.
- Paid-source-derived rules.
- Live outreach eligibility decisions.

## Acceptance

- Rule outputs are documented and typed.
- Every rule result is explainable by source refs or review flags.
- Settings outputs expose enabled signals, disabled signals, weights/thresholds, reason codes, and source-evidence requirements.
- Unknowns stay visible rather than silently passing.
