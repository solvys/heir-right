# Sprint Brief: S5-T2 -- Tax History Adapter Plan

Owner: TP
Parent: S5-ORCH
Dependencies: S5-T1

## Goal

Plan and scaffold tax-history capture for unpaid taxes, reassessments, receipt status, and payer identity.

## Included Scope

- Tax-history fact schema.
- 2+ years unpaid-tax signal.
- Tax amount and year fields.
- Reassessment review flag.
- Tax receipt status and payer identity placeholders.
- Manual receipt download fallback.

## Excluded Scope

- Claiming reliable automated PDF receipt downloads before validation.
- Paid source enrichment.

## Acceptance

- Tax facts can be stored or review-flagged.
- Blocked extraction degrades to an operator task.
- Lead reports can show tax status without invented values.
