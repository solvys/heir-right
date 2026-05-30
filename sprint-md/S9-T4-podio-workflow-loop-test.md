# Sprint Brief: S9-T4 -- Podio Workflow Loop Test

Owner: TP
Parent: S9-ORCH
Dependencies: S9-T1, S9-T3

## Goal

Test the end-to-end Podio workflow loop without disrupting Joshua's team.

## Included Scope

- Lead engine output creates or updates Podio item.
- Source notes and review flags persist.
- Completed lead report is attached or linked.
- Tasks are created for missing research, document prep, offer math, and follow-up.
- Status transitions are visible.
- Hooks/webhooks or scheduled readback verify state.
- Failures create visible blockers.

## Excluded Scope

- Live outreach sends.
- Unreviewed production migration.

## Acceptance

- Podio can close the research/report/task loop.
- Worker readback confirms state.
- Team adoption risk is explicit.
