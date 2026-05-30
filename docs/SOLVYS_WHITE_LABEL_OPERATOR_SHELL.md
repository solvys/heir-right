# Solvys White-Labeled Operator Shell Architecture

Status: post-MVP architecture decision  
First implementation: HeirRight MVP  
Extraction target: reusable Solvys shell after HeirRight proves the pattern

## Product Decision

Solvys should build white-labeled operator shells for client projects, not one generic client cockpit. Each shell should feel native to the client's workflow, language, audience, and business model.

The shared layer is infrastructure, not visible sameness:

- local project runtime;
- Linear-backed sprint/task source of truth;
- project-specific navigation schema;
- bottom command/composer surface;
- lightweight agent activity drawer;
- analytics/error/monitoring event contracts;
- artifact/run/document/report primitives;
- Solvys admin dashboard for cross-project analytics and control.

## Anti-Generic Rule

Permanent panes must not be hard-coded as a universal template.

Every project shell defines its own navigation from its operating model. For HeirRight, that may mean dossiers, lead reports, CRM queues, source runs, documents, and blockers. For another client, the nav may be sales funnels, workouts, claims, classrooms, bookings, or incidents.

The reusable system should provide:

- a shell frame;
- nav registry;
- route/layout contracts;
- command/composer primitive;
- activity drawer primitive;
- analytics/event primitive;
- Linear sync primitive.

The client product decides:

- tab names;
- tab order;
- primary workspace;
- dashboard metaphor;
- tone;
- density;
- data hierarchy;
- workflow-specific actions.

## Shell Shape

Required shared primitives:

1. Bottom composer
   - The bottom input/composer remains the main command surface.
   - It can run project commands, ask questions, create Linear-linked tasks, start local runs, and surface operator decisions.

2. Project-specific navigation
   - No universal permanent pane list.
   - Each project declares nav from its domain.
   - HeirRight should start with probate operations, not generic "Tasks / Reports / Settings."

3. Lightweight agent drawer
   - Most client projects should expose only one or two agent streams.
   - Agent visibility is a drawer, not the center of the product.
   - It should show recent actions, blocked steps, run summaries, and handoff notes.

4. Local-first runtime
   - Project shells should run locally during build and validation.
   - Local execution should support build, test, dry-run, artifact preview, and handoff validation.
   - This local runtime becomes the repeatable project bootstrap pattern.

5. Linear as source of truth
   - Linear remains the authoritative source for sprint, task, owner, status, and execution planning.
   - The shell can read/write/sync Linear, but should not invent a competing task system.

6. Analytics and monitoring
   - OpenPanel or PostHog should be evaluated as the analytics/event backend.
   - The shared event contract should cover usage analytics, run events, errors, operator decisions, client adoption, and shell health.

## Solvys Admin Dashboard

Solvys needs an internal admin dashboard above the white-labeled shells.

The admin dashboard should track all client projects with PostHog/OpenPanel-style analytics:

- active users;
- shell sessions;
- feature usage;
- command usage;
- pipeline runs;
- error rates;
- blocked runs;
- review gates;
- handoff completion;
- Linear status sync;
- client adoption signals.

It should also provide deeper controls for Solvys-1 by building:

- project registry;
- client shell registry;
- analytics configuration;
- event schema management;
- error monitoring;
- deployment/runtime health;
- Linear sync status;
- future Teams integration hooks.

Fintheon should later reuse the Solvys-1 control pattern when Teams integration becomes a deeper part of the product.

## Morning Command Center

The morning command screen is not decided yet.

Two candidate modes:

1. Chat-first command center
   - Best for clients who want guided operations, fewer controls, and a conversational workflow.
   - The first screen is a focused operator prompt with recent activity, next decisions, and blocked work nearby.

2. CRM/work-queue command center
   - Best for sales-heavy clients.
   - The first screen is a queue, pipeline, or active work list with quick actions and the composer available at the bottom.

HeirRight should test this decision because many target clients are sales-driven. The first MVP can bias toward CRM/work-queue, while keeping the composer prominent enough to support a chat-first variant.

## HeirRight Starting Point

HeirRight should stay HeirRight-specific through MVP.

The generic shell should be extracted after the MVP proves:

- project-specific nav works;
- bottom composer is useful;
- local dry-runs are repeatable;
- Linear sync can remain authoritative;
- lightweight agent drawer gives enough visibility;
- analytics events capture useful project health;
- the client shell does not feel generic.

Likely HeirRight nav candidates:

- Source Runs
- Dossiers
- Lead Reports
- CRM Queue
- Documents
- Blockers
- Settings

These are candidates, not a universal template.

## Shared Contracts To Extract Later

After HeirRight MVP, extract the reusable shell contracts:

- `ProjectShellConfig`
- `ProjectNavItem`
- `ProjectCommand`
- `ProjectRun`
- `ProjectArtifact`
- `ProjectDecision`
- `ProjectBlocker`
- `ProjectAgentEvent`
- `ProjectAnalyticsEvent`
- `LinearSyncState`

Each future project should supply its own domain adapters and nav configuration while inheriting the local runtime, analytics plumbing, composer, drawer, and Linear sync.

## Guardrails

- Do not design the client shell as a generic dashboard.
- Do not hard-code universal panes.
- Do not make agent visibility the primary UI unless the project calls for it.
- Do not replace Linear as the source of truth.
- Do not choose PostHog vs OpenPanel until the analytics thread resolves the monitoring/error-handling requirements.
- Do not extract the generic shell before HeirRight MVP validates the pattern.
