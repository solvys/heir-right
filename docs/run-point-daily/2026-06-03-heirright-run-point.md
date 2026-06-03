# HeirRight Run Point - 2026-06-03

Branch: `codex/heirright-2026-06-03-s10-t1-t2`  
Pushed remote branch: `origin/codex/heirright-2026-06-03-s10-t1-t2`  
Pushed ref: `origin/codex/heirright-2026-06-03-s10-t1-t2`

## Previous-Day Touchups Reviewed

- Reviewed [`/Users/tifos/Documents/Codebases/heir-right/docs/run-point-daily/2026-06-02-heirright-run-point.md`](/Users/tifos/Documents/Codebases/heir-right/docs/run-point-daily/2026-06-02-heirright-run-point.md) before starting.
- Verified the repo had already moved beyond the June 2 S8/S9 closeout into landed S14/S15 work on `sprint/S14-S15-heirright-2-beta-production-export`.
- Confirmed S9 remains externally blocked on Podio access, controlled write approval, and readback proof, so it was not a safe second lane for today.
- Confirmed the current open local work in Linear was S10/S11, with S10-T1 and S10-T2 available as the next safe two-lane pair.

## Sprint / Milestone Lanes Worked

- S10-T1 - Website Content Intake
- S10-T2 - Visual Direction Prototypes

## Tickets Touched

- `HEI-35`
- `HEI-66`
- `HEI-67`

## What Was Done

- Created the required fresh daily branch from the current safe integration head instead of continuing on yesterday's run-point branch.
- Verified live Linear project state and confirmed the remaining safe repo lanes were S10-T1 and S10-T2.
- Audited the live public site at [heirright.com](https://heirright.com/) to capture the current public positioning, trust claims, CTA structure, and copy posture for the redesign intake.
- Added [`/Users/tifos/Documents/Codebases/heir-right/docs/HEIRRIGHT_WEBSITE_CONTENT_INTAKE.md`](/Users/tifos/Documents/Codebases/heir-right/docs/HEIRRIGHT_WEBSITE_CONTENT_INTAKE.md) with the current-site audit, positioning recommendations, content gaps, and production constraints for the redesign.
- Added the missing S10 scaffold under [`/Users/tifos/Documents/Codebases/heir-right/probate-lead-engine/site-v2/README.md`](/Users/tifos/Documents/Codebases/heir-right/probate-lead-engine/site-v2/README.md), [`/Users/tifos/Documents/Codebases/heir-right/probate-lead-engine/site-v2/index.html`](/Users/tifos/Documents/Codebases/heir-right/probate-lead-engine/site-v2/index.html), and [`/Users/tifos/Documents/Codebases/heir-right/probate-lead-engine/site-v2/styles.css`](/Users/tifos/Documents/Codebases/heir-right/probate-lead-engine/site-v2/styles.css).
- Built three mobile-first homepage directions in the prototype gallery:
  - Civic Ledger
  - Warm Counsel
  - Fast Relief
- Updated [`/Users/tifos/Documents/Codebases/heir-right/docs/HEIRRIGHT_IMPLEMENTATION_ROADMAP.md`](/Users/tifos/Documents/Codebases/heir-right/docs/HEIRRIGHT_IMPLEMENTATION_ROADMAP.md) so S10 is no longer falsely marked Todo and the `site-v2/` scaffold claim is now true.

## What Was Not Done

- No public website was launched.
- No S10-T3 copy/layout draft conversion was started yet.
- No in-app browser screenshot run was captured because the Browser tool surface was not directly callable in this session.
- No Podio, Google, or live CRM validation work was attempted.

## Repo Evidence

- New intake packet:
  - [`/Users/tifos/Documents/Codebases/heir-right/docs/HEIRRIGHT_WEBSITE_CONTENT_INTAKE.md`](/Users/tifos/Documents/Codebases/heir-right/docs/HEIRRIGHT_WEBSITE_CONTENT_INTAKE.md)
- New S10 scaffold:
  - [`/Users/tifos/Documents/Codebases/heir-right/probate-lead-engine/site-v2/index.html`](/Users/tifos/Documents/Codebases/heir-right/probate-lead-engine/site-v2/index.html)
  - [`/Users/tifos/Documents/Codebases/heir-right/probate-lead-engine/site-v2/styles.css`](/Users/tifos/Documents/Codebases/heir-right/probate-lead-engine/site-v2/styles.css)
  - [`/Users/tifos/Documents/Codebases/heir-right/probate-lead-engine/site-v2/README.md`](/Users/tifos/Documents/Codebases/heir-right/probate-lead-engine/site-v2/README.md)
- Status correction:
  - [`/Users/tifos/Documents/Codebases/heir-right/docs/HEIRRIGHT_IMPLEMENTATION_ROADMAP.md`](/Users/tifos/Documents/Codebases/heir-right/docs/HEIRRIGHT_IMPLEMENTATION_ROADMAP.md)
- Source packet paths found during audit:
  - The audit skill still points to Desktop PDF paths that do not exist on this machine.
  - The actual workflow and example lead PDFs are present in the canonical repo root:
    - `/Users/tifos/Documents/Codebases/heir-right/HeirRight Workflow. pdf.pdf`
    - `/Users/tifos/Documents/Codebases/heir-right/AMARANTHE MOREAU EST OF EST OF ACHILLE V MOREAU Family Tree.pdf`

## Validation Commands / Results

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm build
```

Passed.

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm --filter @ple/worker test
```

Passed. Validation output reported `ok: true` with latest run, dossier, Podio dry-run payload, internal summary, and completed report outputs.

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm --filter @ple/worker run:dry -- --address="20611 NW 33rd Pl, Miami Gardens, FL 33056" --owner="Fresh public-source lead"
```

Passed. Dry run reported:

- `status: ready_for_review`
- `workflowStatus: review_required`
- `operatorQueueState: manual_review`

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm --filter @ple/artifact build
```

Passed.

```bash
python3 -m http.server 4176 --directory /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine/site-v2
curl -I http://127.0.0.1:4176/
curl -s http://127.0.0.1:4176/ | sed -n '1,40p'
```

Passed as a local serve check. The prototype page returned `HTTP/1.0 200 OK` and served the expected S10 review HTML.

## /solvys-heir-audit

```text
/solvys-heir-audit
Source checked: HeirRight deal-flow checklist, canonical repo workflow PDF path, canonical repo example lead packet path, live heirright.com homepage, run-point docs, roadmap, Linear project state, and new S10 repo artifacts
Backward: created the required fresh daily branch, confirmed S9 remains externally blocked, turned S10-T1 into a concrete website intake packet, created the missing site-v2 scaffold, and produced three mobile-first public-site directions for operator/client review
UX pass: aligned
Forward: move into S10-T3 copy/layout drafts on top of the Civic Ledger direction unless Joshua/Sam prefer another concept; keep S9 blocked until Podio access and readback proof exist
Alignment: aligned with gaps
Required corrections before complete:
- update the solvys-heir-audit skill source paths so they point at the canonical repo PDF files that exist in this checkout, not the missing Desktop paths
- capture a rendered browser screenshot pass on site-v2 when a direct Browser tool path is callable again
```

## Remaining Blockers

- S9 remains blocked on Podio workspace access, credentials, controlled write approval, and readback proof.
- The audit skill's PDF source paths are stale for this machine and should be corrected in a later maintenance pass.
- S10 still needs direction selection plus S10-T3 copy/layout drafts before any public-site build work starts.

## Decisions Needed From Sam

- Pick the preferred S10 direction for the public-site build:
  - Civic Ledger
  - Warm Counsel
  - Fast Relief
- Confirm whether Texas should stay on the public site as an active market.
- Confirm whether the founder faith language and current testimonial quotes are approved for continued public use.

## 11 AM Review Packet

### What was done

- The HeirRight website redesign now has a real intake packet grounded in the current live site and onboarding docs.
- The missing `site-v2` scaffold now exists in the repo.
- Joshua/Sam now have three clear mobile-first design directions to review before copy/layout drafting starts.

### What was not done

- No final public site was built or launched.
- No screenshot-based browser proof was captured.
- No live Podio or Google export validation was attempted.

### What needs Sam's review

- Choose the preferred website direction.
- Confirm market scope, public claims, and any disclaimer edits.
- Decide whether to keep the current founder-faith copy posture on the public site.

### What tomorrow's agent should improve before new work

- Stay on a fresh 2026-06-04 branch; do not continue work on `codex/heirright-2026-06-03-s10-t1-t2`.
- If no blocker changes on S9, move directly into S10-T3 copy/layout drafts using Civic Ledger as the default direction.
- If Browser tooling is callable, capture screenshot proof of the prototype gallery before modifying it further.
- If Sam picks a direction, convert that selection into a focused public-site draft instead of maintaining three equal concepts.

## Closeout State

- Ready for review on S10-T1 and S10-T2.
- Needs more implementation for S10-T3 through S10-T5.
- S9 remains blocked and should not be over-claimed as complete.
