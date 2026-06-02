# Claude Cowork Podio Automation Artifact

Status: architecture direction  
Purpose: automate HeirRight's deal flow through a controlled Solvys/HeirRight cloud worker instead of relying on Zapier as the core integration layer

## Decision

Podio is now the leading CRM path unless smoke tests disprove it.

The lead engine should run as a Claude Cowork automation artifact that integrates directly with Podio using the best available official surfaces:

- Podio API;
- Podio webhooks/hooks;
- Podio MCP, if workspace access and auditability are acceptable;
- scheduled worker jobs;
- direct task/item/comment/file operations.

Zapier may be used only as a tactical bridge for a narrow missing action. It should not become the core automation architecture.

## Intended Shape

```text
County/public sources
  -> Lead engine worker
  -> SourceFact / RawDossier / LeadReport
  -> Podio adapter
  -> Podio items, tasks, comments, files, statuses
  -> Podio hooks / worker events
  -> next action automation
  -> operator review gate
```

The worker is the automation brain. Podio is the CRM/work queue. The operator shell is the visibility and review surface.

## What The Artifact Owns

- source runs;
- estate/address/folio/case intake;
- source evidence normalization;
- dossier generation;
- completed lead report generation;
- offer/profit math payloads;
- document packet creation;
- Podio item/task/comment/file sync;
- readback validation;
- workflow-state transitions;
- review gate enforcement;
- audit logs;
- retry/dead-letter handling;
- no-auto-send enforcement.

## What Podio Owns

- CRM record of work;
- lead/opportunity item;
- team task queue;
- human assignment;
- comments/status history;
- attached or linked reports/documents;
- review fields;
- follow-up tasks;
- operator-visible pipeline stages.

## Deal Flow Automation Targets

The 30-day objective is not just "sync to CRM." It is closed-loop workflow automation.

Targets:

- create/update a lead item from a raw dossier;
- preserve estate name as a primary visible identifier;
- keep property address, folio, owner, and county searchable;
- create review tasks for missing property, deed, tax, probate, heirship, offer, and document steps;
- create disqualification/review states for company owner, recent sale, source block, duplicate, or missing evidence;
- attach or link completed lead reports;
- create document-prep tasks;
- create follow-up tasks as drafts/manual-review tasks only;
- enforce no automated calls, texts, emails, or external sends without future approval;
- read back Podio records and verify field/task/report persistence;
- log failed syncs as blockers instead of hiding them.

## Podio Validation Gates

Current status: prep-only. The lead engine emits Podio dry-run payloads with outreach workflow fields, manual follow-up tasks, CSV dry-run requirements, safe test-write steps, and readback checks. Podio is not validated for live automation until client-approved credentials, workspace/app IDs, CSV exports, and explicit live-write approval are supplied.

Podio remains the CRM only if it passes these gates:

1. Auth works with client-approved credentials.
2. App definitions and field IDs can be discovered.
3. Items can be created and updated.
4. Tasks can be created and assigned.
5. Comments/notes can store source refs and review flags.
6. Files or external links can attach completed lead reports.
7. Hooks/webhooks can trigger worker follow-up or readback.
8. API-created items do not silently bypass required workflow automation, or the worker can own those automations directly.
9. MCP access, if used, is auditable and permission-bounded.
10. Exports/backups remain available for transition safety.

## Zapier Rule

Zapier is allowed only if:

- direct Podio API/MCP/hooks cannot perform a specific action;
- the action is narrow and non-critical;
- failure does not corrupt CRM state;
- the worker still keeps the authoritative sync/audit trail.

Zapier is not allowed as:

- the primary orchestration engine;
- the only audit trail;
- the only error handling layer;
- the system that decides lead qualification or outreach readiness.

## 30-Day Success Metric

By the 30-day milestone, the Claude Cowork artifact should automate at least 60% of front-end qualified lead generation and completed lead report creation, plus create text/email follow-up scaffolding as draft/manual-review workflow tasks in Podio.

Concrete acceptance:

- Podio integration creates or updates workflow records from lead engine output.
- Lead reports are linked or attached.
- Review/disqualification/doc-ready/outreach-blocked states are visible in Podio.
- Follow-up tasks are created without sending live outreach.
- Worker readback verifies records after sync.
- Failed source/CRM operations create visible blockers.

## 90-Day Success Metric

By the 90-day milestone, the artifact should support full document-prep automation and a functioning deal engine that produces qualified prospects with closing opportunities.

Concrete acceptance:

- completed lead report and offer math are operational;
- 10+ document templates are generated as draft packets;
- Podio workflow states reflect source, report, offer, document, and follow-up readiness;
- operators can run the workflow without manual duplicate data entry across tools;
- audit trail supports source facts, CRM syncs, generated documents, and review approvals.
