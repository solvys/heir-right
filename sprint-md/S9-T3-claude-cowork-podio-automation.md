# Sprint Brief: S9-T3 -- Claude Cowork Podio Automation Artifact

Owner: TP
Parent: S9-ORCH
Dependencies: S9-T2

## Goal

Define and validate the Claude Cowork artifact that runs the lead engine and automates Podio workflow state without relying on Zapier as the core automation layer.

## Included Scope

- Worker/artifact contract in `docs/CLAUDE_COWORK_PODIO_AUTOMATION_ARTIFACT.md`.
- Podio item create/update path.
- Podio task create/assign path.
- Podio comment/source-note path.
- Podio file/link report attachment path.
- Podio status transition path.
- Hook/webhook/readback path.
- Retry/dead-letter behavior.
- No-auto-send guard.

## Excluded Scope

- Final migration.
- Paid CRM subscription commitment.
- Custom mini-app embedding requirement.
- Core Zapier orchestration.

## Acceptance

- Claude Cowork artifact can close the Podio workflow loop in dry-run or controlled sync mode.
- Gaps are listed as Podio blocker, worker-owned automation, or fallback-CRM candidate.
- No live outreach is sent.
