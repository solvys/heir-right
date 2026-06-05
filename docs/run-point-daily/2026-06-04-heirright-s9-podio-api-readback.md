# HeirRight S9 Podio API Mapping + Controlled Write/Readback - 2026-06-04

Branch: `v2.0.1/heirright-s9-podio-api-readback`
Linear: `HEI-61`
Sprint refs: `S9-ORCH`, `S9-T1`, `S9-T3`, `S9-T4`, `S15-T2`

## Browser Audit Evidence

- Authenticated Podio browser access was confirmed.
- Workspace: `Texas Equity Pros LLC`
- App: `Leads`
- App id: `24265877`
- Space id: `7008942`
- Current lead item count shown in Podio: `689`
- Add Lead form was inspected without saving or typing into any production item.
- No existing Podio lead was edited or deleted.

## Repo Changes

- Added a verified Leads schema preset for Podio app `24265877` in the worker exporter.
- Updated the current Podio export contract to use:
  - `PODIO_ACCESS_TOKEN`
  - `PODIO_APP_ID=24265877`
  - `PODIO_FIELD_MAP_JSON` as an override, with built-in Texas Equity Pros Leads mapping when unset
  - `PODIO_REPORT_FILE_URL` when Google does not produce a report URL first
  - `PODIO_LIVE_WRITE_APPROVED=true` before any live item creation
- Mapped the verified Leads fields:
  - `estate_name` -> `address-2` / Estate Name
  - `lead_status` / `report_status` -> `lead-status`, conservative option `Cold`
  - `deal_status` -> `deal-status`, conservative option `Needs to be contacted`
  - `property_address` -> `map-address` / Property Map Address
  - `report_link` -> `family-tree-link` / Lead Report Link
  - `case_number` -> `case-number`
- Kept source phone/email/offer fields out of the source-derived mapping. The one controlled test path requires explicit test-only defaults for required Podio form fields:
  - `PODIO_TEST_PHONE`
  - `PODIO_TEST_EMAIL`
  - `PODIO_LEAD_POINT_PROFILE_ID`
- Added `export:podio-live-test`, which creates a payload named `HEIRRIGHT TEST - DO NOT WORK - <timestamp>` and then calls the Podio-only live export path.
- Updated S9 readiness reporting so it no longer reports only the legacy `PODIO_CLIENT_ID`, `PODIO_CLIENT_SECRET`, and `PODIO_APP_TOKEN` blockers.
- Updated `.env.example` and `docs/podio-crm-dossier-mapping.md` to the current bearer-token contract.

## Validation

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm build
```

Passed. Turbo reported 3 successful package builds.

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm --filter @ple/worker test
```

Passed. Validation output reported `ok: true`, run id `run-1780606749246-20611-nw-33rd-pl-miami-gardens-fl-33056`, and 49 facts.

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm --filter @ple/worker export:dry
```

Passed. Google and Podio routes both returned `mode: "dry_run"` with explicit skipped-live-readback blockers.

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm --filter @ple/worker export:podio-live-test
```

Failed closed as expected because no `PODIO_*` credentials were loaded in the runtime environment. The command produced a test title `HEIRRIGHT TEST - DO NOT WORK - 2026-06-04T20:57:08.339Z`, returned `mode: "blocked"`, `readbackOk: false`, and wrote `output/podio-live-export-result.json`. No Podio API write was attempted.

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm --filter @ple/worker run:dry -- --address="20611 NW 33rd Pl, Miami Gardens, FL 33056" --owner="Fresh public-source lead"
```

Passed. Dry run reported `status: ready_for_review`, `workflowStatus: review_required`, and `operatorQueueState: manual_review`.

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm --filter @ple/artifact build
```

Passed.

## Live Proof Status

The repo is ready for the approved controlled Podio-only test item, but live proof is still blocked by missing API runtime config:

- `PODIO_ACCESS_TOKEN`
- `PODIO_APP_ID=24265877`
- `PODIO_LIVE_WRITE_APPROVED=true`
- `PODIO_TEST_PHONE`
- `PODIO_TEST_EMAIL`
- `PODIO_LEAD_POINT_PROFILE_ID`

Once those are present, run:

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm build
pnpm --filter @ple/worker export:podio-live-test
```

Expected success evidence: Podio item created in `Leads`, source-note comment created, manual review task created, item readback succeeds, and `output/podio-live-export-result.json` records `mode: "live"` and `readbackOk: true`.

## Guardrails Preserved

- Outreach remains manual-review only.
- No calls, texts, emails, letters, or offer sends are enabled.
- No existing real lead is edited or deleted by the test command.
- Live Podio mutation requires the explicit `PODIO_LIVE_WRITE_APPROVED=true` guard.
