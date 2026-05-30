# Sprint Brief: S11-T4 -- Local Runtime + Linear Sync

## Goal

Make local project execution repeatable while keeping Linear as the task and planning source of truth.

## Build Scope

- Local project runtime contract.
- Build/test/dry-run command registry.
- Artifact preview links.
- Linear project/cycle/issue sync state.
- Command output and blocker capture.
- Local storage boundaries.

## Exclusions

- Replacing Linear with a custom task database.
- Hiding failed local runs behind successful UI states.

## Acceptance

- Shell can show local run/build/test state.
- Linear remains authoritative for sprint and issue state.
- Local failures become visible blockers.
