# Sprint Brief: S11-ORCH -- White-Labeled Operator Shell Foundation

Date: Post-HeirRight MVP
Goal: extract the reusable Solvys operator shell pattern after HeirRight validates the MVP.

This sprint must preserve project-specific product design. It creates shared shell infrastructure without forcing every client into the same navigation, dashboard, or workflow metaphor.

## Tracks

| Track | Title | File |
| --- | --- | --- |
| S11-T1 | Project Shell Contract | `@sprint-md/S11-T1-project-shell-contract.md` |
| S11-T2 | HeirRight Shell MVP Pattern | `@sprint-md/S11-T2-heirright-shell-mvp-pattern.md` |
| S11-T3 | Solvys Admin Analytics Hub | `@sprint-md/S11-T3-solvys-admin-analytics-hub.md` |
| S11-T4 | Local Runtime + Linear Sync | `@sprint-md/S11-T4-local-runtime-linear-sync.md` |
| S11-T5 | Extraction + Solvys-1/Fintheon Hooks | `@sprint-md/S11-T5-extraction-solvys-fintheon-hooks.md` |

## Acceptance

- Shell infrastructure supports project-specific navigation.
- HeirRight Settings can expose client-tunable lead-quality toggles without making those settings the generic shell default.
- Bottom composer is preserved as the command surface.
- Agent visibility is a lightweight drawer.
- Linear remains source of truth for task/status planning.
- OpenPanel/PostHog integration path is represented behind an event contract.
- Solvys admin dashboard requirements are documented for cross-project analytics and Solvys-1 control.
- Generic extraction is gated until after HeirRight MVP validation.

## Exclusions

- Cookie-cutter permanent panes.
- Replacing Linear with an internal task system.
- Forcing every client into a chat-first or CRM-first home screen.
- Final PostHog vs OpenPanel choice before analytics evaluation is complete.
