# Sprint Brief: S5-T5 -- Source Evidence QA

Owner: TP
Parent: S5-ORCH
Dependencies: S5-T1, S5-T2, S5-T3, S5-T4

## Goal

Validate that workflow rules and source facts preserve evidence discipline.

## Included Scope

- SourceRef presence checks.
- Review-flag presence checks.
- No invented tax/deed/probate values.
- Report visibility checks.
- QA fixture for at least one lead.

## Excluded Scope

- Live success claims for blocked source extraction.

## Acceptance

- Every major claim has source refs or review flags.
- Missing evidence fails QA as visible review state, not as silent success.
