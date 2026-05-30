# Sprint Brief: S11-T1 -- Project Shell Contract

## Goal

Define the reusable shell contract that lets each client project declare its own navigation, routes, commands, artifacts, and workflow surfaces.

## Build Scope

- `ProjectShellConfig` shape.
- Project-specific nav registry.
- Route/workspace slot contract.
- Bottom composer command contract.
- Lightweight agent drawer event contract.
- Shared artifact/blocker/decision primitives.

## Exclusions

- Universal permanent pane list.
- Generic dashboard copy or layout.
- Client-specific HeirRight behavior beyond example fixtures.

## Acceptance

- A project can define its own tabs without editing shared shell internals.
- Shared shell provides frame/composer/drawer primitives.
- The contract makes project-specific design the default.
