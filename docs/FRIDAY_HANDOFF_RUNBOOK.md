# HeirRight Friday Handoff Runbook

Status: implementation-facing dry-run runbook.

## What Friday Done Means

Friday done is a working local/dry-run system unless external credentials arrive. It must show:

- public-source property-first run;
- official-records/title source availability and blocker flags;
- no-enrichment raw dossier;
- Podio dry-run payload and direct API config requirements;
- internal summary document packet;
- operator artifact dashboard;
- explicit blockers for missing credentials and source extraction gaps.

## Local Commands

```bash
cd probate-lead-engine
pnpm install
pnpm build
pnpm --filter @ple/worker run:dry -- --address="20611 NW 33rd Pl, Miami Gardens, FL 33056" --owner="Fresh public-source lead"
pnpm --filter @ple/worker test
pnpm --filter @ple/artifact build
pnpm --filter @ple/artifact dev
```

Open `http://localhost:4173` after the artifact server starts.

## Cloudflare Worker Deploy

The dry-run pipeline also has a Cloudflare Worker HTTP surface. It does not persist files in the Worker runtime; it returns the same run, dossier, Podio dry-run, and summary payloads directly from HTTP endpoints.

Live Worker URL:

- `https://heirright-probate-lead-engine.sam-e7a.workers.dev`

```bash
cd probate-lead-engine
pnpm install
pnpm build
pnpm --filter @ple/worker dev:cloudflare
pnpm --filter @ple/worker deploy:cloudflare
```

Current deploy auth:

- This machine is authenticated through Wrangler OAuth for `sam@solvys.io`.
- Non-interactive CI deploys should use `CLOUDFLARE_API_TOKEN` plus `CLOUDFLARE_ACCOUNT_ID`.

Useful Worker paths:

- `/health`
- `/dry-run?address=20611%20NW%2033rd%20Pl,%20Miami%20Gardens,%20FL%2033056&owner=Fresh%20public-source%20lead`
- `/latest-run.json`
- `/latest-dossier.json`
- `/podio-dry-run.json`
- `/internal-summary.md`
- `/internal-summary.html`

## Outputs

Worker dry-run outputs are written under:

- `probate-lead-engine/apps/worker/output/latest-run.json`
- `probate-lead-engine/apps/worker/output/latest-dossier.json`
- `probate-lead-engine/apps/worker/output/podio-dry-run.json`
- `probate-lead-engine/apps/worker/output/internal-summary.md`
- `probate-lead-engine/apps/worker/output/internal-summary.html`

## Current Blockers

- CI/non-interactive Cloudflare deploy still needs a scoped `CLOUDFLARE_API_TOKEN`.
- Podio API credentials are not configured.
- Browserbase fallback credentials are not configured.
- Public Miami-Dade apps are reachable, but server-side result extraction still needs endpoint discovery or browser automation.
- Enrichment is intentionally not part of the first milestone.
- No live outreach sends are implemented.
- No legal review or lead-volume guarantees are included.

## Friday Acceptance Checklist

- Run generates `SourceFact[]`.
- Run generates a no-enrichment raw dossier.
- Dossier has sourceRefs or review flags for every major claim.
- Podio dry-run payload is present.
- Internal summary document packet is present.
- Operator artifact displays latest run.
- Missing external systems are listed as blockers.
