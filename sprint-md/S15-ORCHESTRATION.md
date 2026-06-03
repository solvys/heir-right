# Sprint Brief: S15-ORCH -- Google/Podio Export + Readback

Owner: TP
Beta phase: 2.0 Beta
Branch: `sprint/S14-S15-heirright-2-beta-production-export`
Project: HeirRight Deal Engine Automation

## Goal

Turn the completed report packet into a real handoff route for Google Workspace, Podio, or both, with visible connection status and no silent success.

## Tracks

| Track | Title | Brief |
| --- | --- | --- |
| S15-T1 | Google Workspace Export | `@sprint-md/S15-T1-google-workspace-export.md` |
| S15-T2 | Podio Export + Readback | `@sprint-md/S15-T2-podio-export-readback.md` |

## Acceptance

- The Export dropdown calls the export endpoint for Google, Podio, or both.
- Google export prepares Drive, Docs, and Sheet output with readback.
- Podio export creates the item, adds the source-note handoff, creates the review task, and verifies readback.
- Footer statuses show Podio, Google, and Web Search health.
- Failed exports create visible blockers.
