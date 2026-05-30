# Sprint Brief: S9-ORCH -- HeirRight Podio Claude Cowork Automation + Sales Queue Validation

Owner: TP
Date: Thursday, June 4 - Saturday, June 6, 2026
Goal: validate Podio as the leading CRM path, prove the Claude Cowork automation artifact, and keep Macro/Close as fallback options only if Podio fails.

## Scope Rule

This sprint includes direct Podio validation, Claude Cowork artifact planning, and fallback migration safety. It excludes core Zapier dependence and live outreach automation.

## Tracks

| Issue | Title | Brief |
| --- | --- | --- |
| S9-T1 | Podio Technical + MCP Validation | `@sprint-md/S9-T1-podio-technical-validation.md` |
| S9-T2 | CSV Migration Dry Run | `@sprint-md/S9-T2-csv-migration-dry-run.md` |
| S9-T3 | Claude Cowork Podio Automation Artifact | `@sprint-md/S9-T3-claude-cowork-podio-automation.md` |
| S9-T4 | Podio Workflow Loop Test | `@sprint-md/S9-T4-podio-workflow-loop-test.md` |
| S9-T5 | Team Adoption Gate | `@sprint-md/S9-T5-team-adoption-gate.md` |

## Acceptance

- Podio API, hooks/webhooks, MCP feasibility, app/field structure, and readback are validated with a real account/invite.
- Claude Cowork artifact can create/update Podio items, tasks, comments, files/links, and status transitions through controlled automation.
- Zapier is not required for the core automation loop.
- CSV export/import proves migration without risking original Podio/Sheets data.
- Macro and Close remain fallback options if Podio fails automation/readback/team-fit gates.
