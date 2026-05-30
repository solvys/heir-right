# Sprint Brief: S9-T1 -- Podio Technical + MCP Validation

Owner: TP
Parent: S9-ORCH
Dependencies: S7

## Goal

Validate whether Podio can support the required CRM workflow through direct API, hooks/webhooks, MCP where appropriate, and readback verification.

## Included Scope

- Podio account/invite/export requirement.
- API credential checklist.
- Workspace/app/field discovery.
- Safe live-write test plan.
- Podio hooks/webhooks check.
- Podio MCP permission/auditability check.
- Readback/export test plan.
- Zapier/Albato/Browserbase fallback note only for specific blocked actions.

## Excluded Scope

- Live writes without Joshua approval.
- Final CRM migration decision before smoke evidence.
- Core Zapier dependency.

## Acceptance

- Podio is classified as viable, viable with worker-owned fallback automation, or not viable.
- Missing access is reported as blocker.
- MCP is used only if access is permission-bounded and auditable.
