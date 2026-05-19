# Podio CRM Dossier Mapping

Status: Friday implementation v1  
Purpose: define how one raw HeirRight dossier becomes a Podio-ready CRM payload.

## CRM Output Goal

Podio should receive a usable acquisition file, not a thin lead row:

- one lead item for the estate/property;
- source notes for public-record findings and review flags;
- contact placeholders where names exist but outreach data is not yet enriched;
- tasks for human review, document prep, and next action;
- dry-run payloads before any live API sync.

Live writes are not required by Friday unless free/direct Podio API access is confirmed.

## Default Podio Model

The Friday payload models three Podio apps or work areas:

1. Marketing: raw sourced leads, research queue, first human review.
2. Acquisition: active seller/heir communication and negotiation.
3. Disposition: contract/disposition-ready deals.

Friday placement defaults to `Marketing / Needs Review`.

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

## Required Podio Config

Direct/free API path:

- `PODIO_CLIENT_ID`
- `PODIO_CLIENT_SECRET`
- `PODIO_APP_ID`
- `PODIO_APP_TOKEN`

Browser automation fallback path:

- `BROWSERBASE_API_KEY`
- `BROWSERBASE_PROJECT_ID`
- documented workspace/app URL
- operator-approved automation session

## Dry-Run Payload Shape

```json
{
  "mode": "dry_run",
  "provider": "podio",
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

## Failure Behavior

- Missing Podio credentials: block live sync and keep dry-run payload.
- API unavailable or not free: use browser automation contract as fallback.
- Missing app/field mapping: create a review blocker, do not invent fields silently.
- Partial sync: preserve the dry-run payload and retry only failed objects later.
- CRM outage: keep local dossier status as `ready_for_review` and report blocker.

## Friday Exclusions

- no live outreach sends;
- no guaranteed lead volume;
- no legal-review claims;
- no score or enrichment requirement;
- no new county CRM model.
