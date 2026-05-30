# Sprint Brief: S5-T3 -- Deed + OR Book/Page Evidence

Owner: TP
Parent: S5-ORCH
Dependencies: S5-T1

## Goal

Represent deed history and OR book/page evidence as source-backed facts.

## Included Scope

- Latest recorded deed fact shape.
- OR book/page reference fields.
- Sale date and recent-sale rule input.
- Ownership activity notes.
- Mortgage, lien, Lis Pendens, and foreclosure signal placeholders.
- Adverse-possession signal placeholder.

## Excluded Scope

- Guaranteed title extraction without endpoint/browser validation.
- Legal conclusions about ownership or lien priority.

## Acceptance

- Deed/title facts preserve source URLs or review flags.
- Recent-sale logic can consume deed facts.
- Missing deed data remains visible in the report.
