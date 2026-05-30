# Macro CRM Smoke Test Checklist

Status: validation checklist  
Purpose: decide whether Macro can replace Podio as the workflow CRM for HeirRight  
Decision rule: migrate only if Macro closes the operational loop without brittle workarounds

## Test Inputs Needed

- Macro account URL.
- Admin login or screen-share access.
- Company/workspace name.
- API/integration settings page access.
- Domain/site integration name, if Macro requires one.
- App secret/API token, if available.
- Export permission.
- Screenshots or exports of any custom fields created during testing.

Do not use real seller/heir data for the first test. Use a fake probate opportunity.

## Test Lead Fixture

Create one fake lead with:

- estate name: `Estate of John Test`;
- property address: `20611 NW 33rd Pl, Miami Gardens, FL 33056`;
- county: `Miami-Dade`;
- folio/parcel placeholder;
- owner type: `estate / individual review`;
- lead bucket: `qualified lead`;
- source status: `public-source checked`;
- document status: `draft review required`;
- outreach status: `blocked pending review`;
- four contact names or placeholders;
- 4-5 phone numbers across the opportunity/contact group;
- tax flag: `2+ years unpaid - review`;
- deed flag: `latest deed needed`;
- probate flag: `docket review needed`;
- family tree status: `hypothesis needed`;
- next action: `review completed lead report`.

## Manual Product Fit Checklist

Run this inside the Macro UI.

- Can estate name be the primary record title?
- Can property address be secondary but still searchable?
- Can one opportunity/deal hold multiple contacts?
- Can one contact/opportunity hold multiple phone numbers?
- Can custom statuses represent `qualified`, `bonus/warm`, `blocked`, `disqualified`, `doc-ready`, and `outreach approved`?
- Can the team create a research queue before active acquisition?
- Can tasks be created for probate, tax, deed, document prep, and follow-up work?
- Can tasks have owner, due date, status, and notes?
- Can assignment or queue routing support round-robin or a close equivalent?
- Can notes preserve source links and review flags without burying them?
- Can a generated lead report be linked, attached, or stored against the record?
- Can a document status be tracked separately from outreach status?
- Can Macro export the lead/opportunity/contact/task data cleanly?
- Can operators use the UI without forcing workflow changes that Joshua's team will reject?

## API / Integration Checklist

Run this only after the UI model passes the basic product-fit test.

- Locate Macro integration/API settings.
- Confirm whether API access is included in the plan/account.
- Confirm whether API access uses domain + app secret, token, OAuth, webhook URL, or another scheme.
- Confirm whether API can create a lead/request/application.
- Confirm whether API can create or update contacts.
- Confirm whether API can create tasks.
- Confirm whether API can read back a created record.
- Confirm whether API can search by phone.
- Confirm whether API can search by estate name, address, or custom field.
- Confirm whether API can update status/stage.
- Confirm whether API can attach or link documents.
- Confirm whether webhooks or outbound events exist.
- Confirm whether Albato can perform any required action missing from direct API.
- Confirm rate limits, plan limits, and audit logs if visible.

## Lead Engine Push Test

The first technical smoke should push the same fake lead from the HeirRight lead engine into Macro.

Expected adapter output:

- created CRM record ID or clear dry-run payload;
- estate name as primary title;
- property address and folio fields;
- contact placeholders and phone numbers;
- source notes/review flags;
- task list;
- lead report link or attachment placeholder;
- sync status;
- errors and missing mappings listed explicitly.

## Readback Test

After creating the record:

- retrieve the record from Macro;
- verify estate name, address, contacts, phone numbers, statuses, tasks, and notes survived;
- verify source evidence was not collapsed into an unreadable note dump;
- verify exported data can reconstruct the original lead report reference.

## Workflow Automation Test

Try to configure or simulate:

- new qualified lead enters research queue;
- blocked lead creates review task;
- disqualified lead exits active queue;
- doc-ready lead creates document-review task;
- outreach-ready lead remains manual until approved;
- stale follow-up creates reminder;
- assignment routes to a rep or queue.

Macro does not need to host the lead engine UI. It only needs to close the CRM/workflow loop reliably.

## Pass / Fail Scoring

Score each category from 0-2:

- data model fit;
- multi-contact support;
- task/workflow support;
- queue/assignment support;
- API create/update/read;
- export/readback safety;
- lead report linking;
- operator usability;
- migration safety;
- no-auto-send control.

Decision:

- 16-20: Macro is a strong migration candidate.
- 12-15: Macro is viable if gaps are manageable.
- 8-11: keep Macro as secondary; test Close before committing.
- 0-7: do not migrate to Macro.

Hard fail conditions:

- no export path;
- no stable way to create/update leads;
- cannot represent multiple contacts or phone numbers;
- cannot represent blocked/disqualified/review states;
- source evidence only fits as unstructured notes;
- live outreach automation cannot be disabled or gated.

## Evidence To Capture

- screenshots of record model;
- screenshots of integration/API settings;
- sample exported CSV/XLSX;
- sample API request/response if available;
- list of required fields and fields that cannot be represented;
- operator notes on whether the workflow feels better than Podio.
