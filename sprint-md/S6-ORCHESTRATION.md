# Sprint Brief: S6-ORCH -- HeirRight Probate + Heirship Research

Owner: TP
Date: Tuesday, May 26 - Thursday, May 28, 2026
Goal: turn court/probate/family-tree work into an auditable research queue.

## Scope Rule

This sprint models research and operator workflow. It excludes paid-source automation, legal conclusions, and external outreach until approvals are supplied.

## Tracks

| Issue | Title | Brief |
| --- | --- | --- |
| S6-T1 | Estate-Name Search Path | `@sprint-md/S6-T1-estate-name-search-path.md` |
| S6-T2 | Probate/Civil/Family Docket Model | `@sprint-md/S6-T2-probate-civil-family-docket-model.md` |
| S6-T3 | Marriage + Death Indicator Checks | `@sprint-md/S6-T3-marriage-death-indicator-checks.md` |
| S6-T4 | Family Tree Hypothesis | `@sprint-md/S6-T4-family-tree-hypothesis.md` |
| S6-T5 | Paid/Manual Source Governance | `@sprint-md/S6-T5-paid-manual-source-governance.md` |

## Acceptance

- Probate/civil/family docket facts are modeled separately from legal conclusions.
- Affidavit-of-heirs, marriage, obituary, DOB/DOD, incarceration, and family tree evidence can be tracked.
- IDI, Intelius, Ancestry, ForeWarn, VitalChek, PI requests, door knocks, and code-enforcement workflows are approval-gated.
