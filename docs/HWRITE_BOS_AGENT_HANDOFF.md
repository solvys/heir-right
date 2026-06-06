# HWRITE BOS Agent Handoff

Generated: 2026-06-06
Project: HeirRight / HWRITE
Branch: `v2.0.1/heirright-2026-06-06-run-point`

## Identity

HeirRight is a real estate operator workflow for inherited-property review. HWRITE is the internal Solvys shorthand for the HeirRight operator shell and public-site adaptation work in BOS-2026-05.

## Key Paths

| Path | Purpose |
| --- | --- |
| `AGENTS.md` | Repo commands and project rules. |
| `probate-lead-engine/` | TypeScript monorepo for the lead engine and artifact dashboard. |
| `probate-lead-engine/apps/artifact/src/index.html` | HWRITE operator shell validation host. |
| `site-v2/` | Public HeirRight outreach site. |
| `docs/HWRITE_ADMIN_SHELL_PLAN.md` | BOS T2 shell adaptation artifact. |
| `docs/HWRITE_SITE_PLAN.md` | BOS T3 site structure and launch plan. |
| `docs/HWRITE_VISUAL_DIRECTION.md` | BOS T3 visual and logo direction. |
| `docs/S11_OPERATOR_SHELL_FOUNDATION.md` | Existing shell foundation and extraction record. |
| `docs/run-point-daily/2026-06-06-heirright-run-point.md` | Latest HeirRight run-point validation and blockers. |

## What Changed For BOS

- T2 now has an explicit HWRITE admin shell plan that maps the reusable T1 shell to the existing HeirRight artifact shell.
- T3 now has a site plan and visual/logo direction for the existing `site-v2/` public site.
- The existing public site implementation remains the source of truth for today's site prototype; no duplicate repo is needed.

## Guardrails

- Keep all client-facing language plain and real-estate specific.
- Do not call the public site an AI dashboard or product marketplace.
- Do not imply legal advice, guaranteed sale, automatic offer, or automatic outreach.
- Do not perform live Podio, Google, CRM, email, text, call, or letter actions without explicit approval and readback proof.
- Keep generic shell extraction downstream of HeirRight validation.

## Validation Commands

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm build
pnpm test

cd /Users/tifos/Documents/Codebases/heir-right/site-v2
pnpm build
```

## Next Useful Work

- Connect the public review-request flow only after TP/Sam chooses the production destination.
- If Podio runtime config arrives, rerun the controlled Podio live test exactly once with approval.
- If no external credentials arrive, focus on milestone acceptance packets and public-site production readiness.
- Before claiming HeirRight work complete, run `/solvys-heir-audit` against the current changed files and blocker state.
