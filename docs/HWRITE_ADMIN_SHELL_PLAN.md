# HWRITE Admin Shell Plan

Status: BOS-2026-05 T2 local artifact
Last updated: 2026-06-06
Branch: `v2.0.1/heirright-2026-06-06-run-point`
Primary surface: `probate-lead-engine/apps/artifact/src/index.html`

## Purpose

HWRITE is the HeirRight operator shell adaptation of the reusable Solvys admin shell. It should prove the shared shell pattern inside a real probate and sales workflow before Solvys extracts generic infrastructure for other clients.

The public product should still feel like HeirRight, not a generic Solvys dashboard. The shared layer is the shell anatomy: project navigation, work queue, detail rail, bottom command deck, activity drawer, runtime state, blocker state, and review-gated external actions.

## Source Anchors

- BOS brief: `/Users/tifos/Documents/Codex/2026-05-22/codex-handoff-bookmark-opportunity-strategy-date/plans/BOS-2026-05-T2-hwrite-admin-shell.md`
- BOS source index: `/Users/tifos/Documents/Codex/2026-05-22/codex-handoff-bookmark-opportunity-strategy-date/plans/BOS-2026-05-SOURCE-INDEX.md`
- Reusable shell: `/Users/tifos/Documents/Codebases/solvys-fintheon-admin-shell`
- Reusable interaction model: `/Users/tifos/Documents/Codebases/solvys-fintheon-admin-shell/INTERACTION_MODEL.md`
- Client guide: `/Users/tifos/Documents/Codebases/solvys-fintheon-admin-shell/CLIENT_ADAPTATION_GUIDE.md`
- Existing HeirRight shell foundation: `docs/S11_OPERATOR_SHELL_FOUNDATION.md`
- White-label shell decision: `docs/SOLVYS_WHITE_LABEL_OPERATOR_SHELL.md`

## Current Implementation State

The HeirRight artifact app already carries the core HWRITE shell behavior:

- HeirRight-specific navigation: Source Runs, Dossiers, Lead Reports, CRM Queue, Documents, Blockers, Settings.
- CRM/work-queue home pattern with lead review and report context.
- Bottom command composer for report review, blocker capture, export staging, Linear context, and dry-run review.
- Lightweight activity drawer for ready, review, and blocked events.
- Lead-quality settings for source-signal weighting, tax pressure, reason codes, deed proof, review-only guardrail, and paid-source approval.
- Runtime panel for local commands and preview state.
- Prep-only export language that keeps Podio and Google routes blocked until live config, approval, and readback proof exist.

This means BOS T2 does not need a duplicate shell repo. It needs a clear HWRITE adaptation plan that ties the shipped T1 shell primitives to the repo-local HeirRight implementation.

## Shell Anatomy Mapping

| T1 reusable shell primitive | HWRITE / HeirRight adaptation | Operator meaning |
| --- | --- | --- |
| Workspace switcher | HeirRight Ops shell context | Work inside the probate lead desk, not a generic admin area. |
| Left workflow panel | HeirRight navigation | Move between source runs, dossiers, reports, CRM queue, documents, blockers, and settings. |
| Main stage | Lead review queue and active dossier/report | Decide whether the lead is ready, needs source work, is blocked, or can be staged for handoff. |
| Right context panel | Report rail and source trail | Show title, tax, probate, heir, and blocker context beside the active lead. |
| Bottom command deck | Report, Blocker, Stage export, Linear, Dry run | Stage operator decisions without live CRM, outreach, or document writes. |
| Drag-up drawer | Agent activity and blocker events | Show what changed, what is blocked, and what needs human review. |
| Runtime state | Local build, dry-run, artifact preview, export dry-run | Help agents validate work without asking the client to use repo tooling. |

## Operator Navigation

The shell should keep these HeirRight-specific sections:

1. Source Runs
   - Shows recent county/public-source checks, dry-run status, and source gaps.
   - Primary states: ready for review, needs source, blocked.
2. Dossiers
   - Shows the active property and owner/estate evidence.
   - Must separate confirmed public records from notes that still need review.
3. Lead Reports
   - Shows the operator-facing packet and next recommended review action.
   - Must avoid raw JSON or developer-facing language.
4. CRM Queue
   - Stages Podio/Google handoff only after approval and readback proof.
   - "Sent to CRM" is a post-readback state, not a button copy shortcut.
5. Documents
   - Shows prepared files and review packets.
   - No external document send without approval.
6. Blockers
   - Groups missing credentials, missing source records, legal/compliance review, paid-source approval, and client decisions.
7. Settings
   - Lets Solvys/operators adjust lead-quality thresholds as review criteria.
   - Does not approve live outreach, volume claims, or legal conclusions.

## Review States

Use these states consistently across table rows, cards, drawers, and handoff notes:

| State | Plain-language label | Meaning |
| --- | --- | --- |
| `needs_source` | Needs source | A required public record, owner detail, probate fact, or property source is missing. |
| `review_ready` | Ready for review | The lead packet has enough evidence for an operator to inspect it. |
| `blocked` | Blocked | Work cannot continue until credentials, client input, approval, or source access arrives. |
| `stage_for_crm` | Stage for CRM | A local package can be prepared, but no live write has occurred. |
| `sent_to_crm` | Sent to CRM | A live write has completed and has readback proof. |

## Command Deck Rules

The bottom deck stays a control surface, not a chatbot.

- Report: open or summarize the lead packet.
- Blocker: record what prevents forward motion.
- Stage export: prepare a local Podio/Google handoff package.
- Linear: show sprint/ticket source-of-truth context.
- Dry run: stage a local pipeline command for the agent, not the client.

Commands may create local notes, local events, or staged packets. They must not send messages, create live outreach, write to Podio/Google, or change production data unless the repo service has explicit approval, credentials, and readback validation.

## External-Action Guardrails

Keep these locked by default:

- Live Podio writes.
- Google Workspace live export/readback.
- Text, email, call, letter, or CRM outreach.
- Paid source lookup.
- Legal, tax, title, or probate conclusions.
- Public volume claims.

The shell may display blockers and staged outputs for those areas. It may not imply completion until the external proof exists.

## Implementation Notes

- Keep `probate-lead-engine/apps/artifact/src/index.html` as the validation host for HWRITE shell behavior.
- Keep `docs/S11_OPERATOR_SHELL_FOUNDATION.md` as the broader extraction record.
- Use this document as the BOS T2 pickup surface when future agents adapt the T1 shell into a reusable package.
- Do not extract shared shell code until HeirRight has been validated against real operator use.
- Do not make HeirRight navigation the universal default for other Solvys clients.

## Acceptance Checklist

- HWRITE shell behavior is mapped to T1 shell primitives.
- Operators can tell what each panel, drawer, state, and command is for.
- Review-ready, blocked, needs-source, staged-for-CRM, and sent-to-CRM states are separated.
- Generic Solvys shell extraction remains downstream of HeirRight proof.
- No live outreach, CRM write, legal claim, or production export is implied.
