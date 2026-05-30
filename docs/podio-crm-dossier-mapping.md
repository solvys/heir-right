# HeirRight CRM Dossier Mapping

Status: Friday implementation v1  
Purpose: define how one raw HeirRight dossier becomes a CRM-ready payload through a provider-neutral CRM adapter. Podio is the CRM/work queue of record unless smoke tests disprove it. Macro and Close remain fallback candidates if Podio cannot close the workflow loop.

## CRM Output Goal

The CRM should receive a usable acquisition file, not a thin lead row:

- one lead item for the estate/property;
- source notes for public-record findings and review flags;
- contact placeholders where names exist but outreach data is not yet enriched;
- tasks for human review, document prep, and next action;
- dry-run payloads before any live API sync.

Live writes are not required by Friday unless a CRM provider passes the smoke test and Joshua approves controlled sync.

## CRM Decision Path

1. Keep the lead engine CRM boundary provider-neutral through `CrmAdapter`.
2. Treat Podio as the leading CRM path unless smoke tests disprove it.
3. Validate Podio API, hooks/webhooks, MCP access, item/task/comment/file operations, and readback behavior in the real workspace.
4. Build the lead engine as a Claude Cowork automation artifact that owns orchestration and talks directly to Podio.
5. Avoid Zapier as the core automation layer; use it only as a narrow fallback bridge for a specific missing action.
6. Keep Macro and Close as fallback candidates if Podio cannot support automation/readback/team-fit requirements.
7. Use Podio/Sheets exports for migration safety and backups.

Podio does not need to host the lead engine as a mini-app. The Claude Cowork artifact can run the lead engine and sync workflow state into Podio. Podio needs to close the CRM/workflow loop: records, contacts, phone numbers, tasks, queues, reports, follow-ups, exports, hooks, and readback.

Human testing for CRM behavior happens at milestone gates only. Day-to-day S5-S11 agent tickets can validate dry-run payloads, adapter contracts, and readback probes without creating a separate human review loop unless credentials, live-write approval, legal/compliance review, or milestone acceptance is blocked.

Macro and Close remain fallback options if Podio cannot represent or automate the workflow.

## Adapter Contract

Every CRM provider must satisfy the same adapter expectations:

- `healthcheck()` reports auth/API readiness and mode.
- `dryRun(dossier)` produces the provider-specific payload without writing.
- `sync(dossier)` writes only after explicit approval and returns external IDs.
- `readBack(externalId)` or equivalent verification is required before production confidence.
- `describeRequiredConfig()` lists missing secrets, workspace IDs, field IDs, and account settings.
- provider-specific gaps are represented as mapping blockers, not hidden notes.

Provider candidates:

- `podio`: leading CRM path if API/MCP/hooks/readback smoke tests pass.
- `macro`: fallback candidate if Podio fails.
- `close`: fallback candidate if Podio fails sales workflow requirements.
- `dry_run`: local payload and operator review mode.

## Default CRM Model

The Friday payload models three apps or work areas:

1. Marketing: raw sourced leads, research queue, first human review.
2. Acquisition: active seller/heir communication and negotiation.
3. Disposition: contract/disposition-ready deals.

Friday placement defaults to `Marketing / Needs Review`.

Workflow-informed placement should also support a research queue before acquisition. The PDF shows leads moving through owner qualification, source research, family tree buildout, completed lead report, offer math, and only then outreach/manager follow-up.

Meeting notes add two lead buckets:

- Qualified leads: prospects that pass research checks and warrant active prospecting; currently managed in Google Sheets.
- Bonus leads: warm leads actively raising their hands and wanting to do business; currently added to Podio CRM.

Round-robin sales distribution must support one opportunity with multiple contacts or 4-5 phone numbers.

## Field Mapping

| Dossier field | Podio target | Notes |
| --- | --- | --- |
| `summary.displayName` | Lead title | Human-readable lead name |
| `property.address.value` | Property address field | Primary seed if parcel is missing |
| `property.ownerName.value` | Owner/estate field | May be seed value until source-confirmed |
| `property.parcelId.value` | Folio/parcel field | Preferred dedupe key when present |
| `property.county.value` | County field | Friday scope is Miami-Dade |
| `titleEvents[]` | Source/title notes | Every event keeps a source ref |
| `audit.reviewFlags` | Review flags field | Stored visibly, not hidden in logs |
| `summary.nextBestAction` | Next action field + task | Human operator queue |
| `narrative` | Dossier note | Deterministic narrative, no score |
| `documentPacket.status` | Document status field | `draft_review_required` by default |
| `crm.status` | CRM sync status | `not_configured`, `ready`, `synced`, `failed` |
| `summary.estateName` | Estate name field | First-class lookup path from onboarding |
| `qualification.ownerType` | Owner type field | Individual/company/trust/estate/unknown |
| `qualification.disqualificationReason` | Disqualification status | Company-owned, recent sale within 5 years, blocked source, duplicate, other |
| `property.taxHistory` | Tax history notes/fields | Unpaid years, amount, reassessment, receipt status, payer identity |
| `property.deedHistory` | Deed/title notes | OR book/page, sale date, ownership activity, adverse possession, mortgage/lien/Lis Pendens signals |
| `probate.caseStatus` | Probate status field | Case number, docket status, affidavit of heirs, docs available |
| `heirship.familyTreeStatus` | Family tree status | Not started, hypothesis, needs review, reviewed |
| `heirship.contacts[]` | Contact placeholders | Names and relationships before enrichment/live outreach |
| `offerMath` | Offer/profit fields | As-is value, taxes, liens, mortgages, selling/probate/partition costs, equity per heir, offer, profit |
| `outreach.status` | Outreach status | Draft only, not ready, ready for human review, approved manual outreach |
| `lead.bucket` | Lead bucket | Qualified lead or bonus/warm lead |
| `assignment.owner` | Sales rep / queue owner | Supports round-robin distribution |
| `contacts[].phoneNumbers` | Opportunity contact numbers | Multiple numbers per opportunity |

## Required Provider Config

Podio direct/free API path:

- `PODIO_CLIENT_ID`
- `PODIO_CLIENT_SECRET`
- `PODIO_APP_ID`
- `PODIO_APP_TOKEN`

Browser automation fallback path:

- `BROWSERBASE_API_KEY`
- `BROWSERBASE_PROJECT_ID`
- documented workspace/app URL
- operator-approved automation session

Backup/migration fallback:

- Podio CSV export access
- Google Sheets export access for qualified leads
- Podio API/MCP/hooks settings access
- Podio app/field IDs
- Podio file/link attachment path
- Macro account/admin access
- Macro integration/API settings access
- Macro domain/site integration name
- Macro app secret/API token if available
- Close CRM sandbox or trial workspace
- mapping approval from Joshua before live migration

## Dry-Run Payload Shape

```json
{
  "mode": "dry_run",
  "provider": "dry_run",
  "pipeline": {
    "area": "Marketing",
    "status": "Needs Review",
    "source_status": "Public-source checked",
    "doc_ready_status": "Draft review required"
  },
  "leadItem": {},
  "contacts": [],
  "notes": [],
  "tasks": [],
  "requiredConfig": [],
  "fallback": {
    "type": "browser_automation",
    "requiredConfig": []
  }
}
```

## Workflow Pipeline Stages

Suggested Podio stages after the Friday dry-run:

1. Intake / Seeded
2. Owner Qualification
3. Property + Deed Research
4. Tax + Title Review
5. Probate / Court Research
6. Family Tree Buildout
7. Completed Lead Report
8. Offer Math Review
9. Outreach Draft Review
10. Manual Outreach Approved
11. Acquisition
12. Disposition

Podio stages should mirror this flow while keeping estate name as the primary visible opportunity identifier and property address as a secondary field. Macro and Close should mirror the same model only if fallback migration is required.

Default next actions:

- company owner: mark out of scope unless client overrides;
- sale within 5 years: mark disqualified/review;
- unpaid taxes 2+ years: create tax review task;
- missing affidavit/probate docs: create probate document request task;
- family tree incomplete: create heirship research task;
- offer math incomplete: create underwriting task;
- script/doc not reviewed: keep outreach blocked.

## Failure Behavior

- Missing provider credentials: block live sync and keep dry-run payload.
- Podio API/MCP/hooks too limited: document the blocker and test whether the Claude Cowork artifact can own the missing automation directly.
- Macro/Close workflow/API gap: document whether fallback migration is viable.
- Migration requested: use CSV dry-run first and keep Podio intact.
- API unavailable or not free: use browser automation contract as fallback.
- Missing app/field mapping: create a review blocker, do not invent fields silently.
- Partial sync: preserve the dry-run payload and retry only failed objects later.
- CRM outage: keep local dossier status as `ready_for_review` and report blocker.
- Missing workflow fields: create a mapping blocker, do not collapse them into generic notes.
- Outreach not approved: create draft tasks only, never live-send calls, texts, emails, or letters.
- Zapier dependency: allow only as a narrow bridge, never as the primary orchestration/audit layer.

## Friday Exclusions

- no live outreach sends;
- no guaranteed lead volume;
- no legal-review claims;
- no score or enrichment requirement;
- no new county CRM model.
