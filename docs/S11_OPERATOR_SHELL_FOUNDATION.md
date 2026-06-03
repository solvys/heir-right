# S11 Operator Shell Foundation

Status: landed locally on 2026-06-03
Sprint: S11 - White-Labeled Operator Shell Foundation
Primary app surface: `probate-lead-engine/apps/artifact/src/index.html`

## Executive Summary

S11 turns the existing HeirRight artifact dashboard into the first project-specific Solvys operator shell pattern. The shell is not a generic Solvys dashboard. HeirRight keeps a probate and sales workflow surface first: source runs, dossiers, lead reports, CRM queue, documents, blockers, settings, report rail, and review-only export prep.

The reusable layer is a contract and set of primitives:

- project-specific navigation registry;
- workspace slots for home, filters, table, details, rail, composer, drawer, settings, and runtime state;
- bottom composer command events;
- lightweight agent activity drawer events;
- lead-quality settings controls;
- blocker, artifact, decision, and run-state primitives;
- provider-agnostic analytics event naming;
- local runtime and Linear sync shape.

Hard boundaries remain:

- Linear is the project source of truth for sprint and issue state.
- Browser UI commands do not execute shell commands.
- Podio and Google exports remain prep-only until live access and readback proof are available.
- No live outreach, CRM mutation, or external document send is approved by this shell work.
- Generic extraction waits until HeirRight MVP validation proves the pattern.

## S11-T1 Project Shell Contract

The shell contract should let each client own its visible workflow while reusing shared runtime, composer, drawer, settings, and event plumbing.

```ts
export type ShellProjectKind = "heirright" | "solvys-1" | "fintheon" | "custom";

export interface ProjectShellConfig {
  projectId: string;
  projectKind: ShellProjectKind;
  displayName: string;
  navigation: ShellNavItem[];
  workspaceSlots: ShellWorkspaceSlot[];
  commands: ShellCommand[];
  settings: ShellSetting[];
  analytics: ShellAnalyticsConfig;
  runtime: LocalRuntimeConfig;
  linear: LinearSyncConfig;
  guardrails: ShellGuardrail[];
}

export interface ShellNavItem {
  id: string;
  label: string;
  icon: string;
  defaultSlot: string;
  eventName: "shell.nav.selected";
}

export interface ShellWorkspaceSlot {
  id: string;
  label: string;
  surface: "home" | "filters" | "table" | "detail" | "rail" | "composer" | "drawer" | "settings" | "runtime";
  projectOwned: boolean;
}

export interface ShellCommand {
  id: string;
  label: string;
  intent: "open-report" | "record-blocker" | "stage-export" | "linear-sync" | "dry-run" | "note";
  mutatesExternalSystem: boolean;
  requiresApproval?: string;
}

export interface AgentActivityEvent {
  id: string;
  projectId: string;
  title: string;
  body: string;
  tone: "ready" | "review" | "blocked";
  createdAt: string;
  source: "composer" | "runtime" | "linear" | "settings" | "export" | "system";
}

export interface ShellGuardrail {
  id: string;
  label: string;
  defaultState: "enabled" | "disabled" | "locked";
  protects: "live-crm-write" | "live-outreach" | "paid-source" | "external-document-send";
}
```

### HeirRight Config Example

```ts
export const heirRightShellConfig: ProjectShellConfig = {
  projectId: "heirright",
  projectKind: "heirright",
  displayName: "HeirRight Ops",
  navigation: [
    { id: "source-runs", label: "Source Runs", icon: "search", defaultSlot: "runs", eventName: "shell.nav.selected" },
    { id: "dossiers", label: "Dossiers", icon: "folder", defaultSlot: "dossiers", eventName: "shell.nav.selected" },
    { id: "lead-reports", label: "Lead Reports", icon: "file-text", defaultSlot: "reports", eventName: "shell.nav.selected" },
    { id: "crm-queue", label: "CRM Queue", icon: "panel-top", defaultSlot: "queue", eventName: "shell.nav.selected" },
    { id: "documents", label: "Documents", icon: "copy", defaultSlot: "documents", eventName: "shell.nav.selected" },
    { id: "blockers", label: "Blockers", icon: "triangle-alert", defaultSlot: "blockers", eventName: "shell.nav.selected" },
    { id: "settings", label: "Settings", icon: "sliders", defaultSlot: "settings", eventName: "shell.nav.selected" }
  ],
  workspaceSlots: [
    { id: "runs", label: "Source Runs", surface: "home", projectOwned: true },
    { id: "lead-table", label: "Lead Table", surface: "table", projectOwned: true },
    { id: "review-rail", label: "Report Rail", surface: "rail", projectOwned: true },
    { id: "composer", label: "Command Composer", surface: "composer", projectOwned: false },
    { id: "activity", label: "Agent Activity", surface: "drawer", projectOwned: false },
    { id: "settings", label: "Lead Quality Settings", surface: "settings", projectOwned: true },
    { id: "runtime", label: "Runtime and Linear", surface: "runtime", projectOwned: false }
  ],
  commands: [
    { id: "open-report", label: "Report", intent: "open-report", mutatesExternalSystem: false },
    { id: "record-blocker", label: "Blocker", intent: "record-blocker", mutatesExternalSystem: false },
    { id: "stage-export", label: "Stage export", intent: "stage-export", mutatesExternalSystem: false, requiresApproval: "live Podio or Google readback" },
    { id: "linear-sync", label: "Linear", intent: "linear-sync", mutatesExternalSystem: false },
    { id: "dry-run", label: "Stage dry run", intent: "dry-run", mutatesExternalSystem: false }
  ],
  settings: [],
  analytics: { provider: "deferred", eventPrefix: "heirright.shell" },
  runtime: { cwd: "probate-lead-engine", previewUrl: "http://localhost:4173" },
  linear: { sourceOfTruth: true, projectName: "HeirRight Deal Engine Automation" },
  guardrails: [
    { id: "review-only", label: "Review-only guardrail", defaultState: "locked", protects: "live-outreach" },
    { id: "podio-readback", label: "Podio readback proof", defaultState: "enabled", protects: "live-crm-write" },
    { id: "paid-source-approval", label: "Paid-source approval", defaultState: "enabled", protects: "paid-source" }
  ]
};
```

## S11-T2 HeirRight Shell MVP Pattern

Implemented in the artifact app:

- sidebar navigation now uses HeirRight shell labels: Source Runs, Dossiers, Lead Reports, CRM Queue, Documents, Blockers, Settings;
- the main workspace states CRM queue first, command center ready, Linear authoritative, and prep-only exports;
- a bottom command composer captures review, report, blocker, export, Linear, and dry-run commands;
- a lightweight activity drawer shows shell events with ready/review/blocked tone;
- lead-quality settings expose source-signal weighting, tax pressure threshold, reason-code set, deed proof, review-only guardrail, and paid-source approval;
- runtime and Linear panels stage local commands, artifact preview, and Linear sync;
- admin metrics show command, blocker, and event counts;
- copy now casts the app as a HeirRight company workspace, not a single-person review desk.

The shell intentionally validates CRM-first and command-center variants together. The table and report rail remain the primary CRM/work-queue home; the composer is a command layer, not the whole product.

## S11-T3 Solvys Admin Analytics Hub

Provider choice is deferred. OpenPanel and PostHog remain acceptable candidates. The event contract must stay provider-agnostic until the Solvys admin hub is selected.

Required event inventory:

| Event | Required properties |
| --- | --- |
| `shell.view` | projectId, projectKind, surface, route, userRole |
| `shell.nav.selected` | projectId, navId, label, previousNavId |
| `shell.command.submitted` | projectId, commandId, intent, mutatesExternalSystem, approvalState |
| `shell.drawer.opened` | projectId, eventCount, blockerCount |
| `shell.settings.changed` | projectId, settingId, oldValue, newValue, reviewOnlyGuardActive |
| `runtime.command.staged` | projectId, commandId, cwd, executedByBrowser=false |
| `run.loaded` | projectId, runId, evidenceCount, workflowStatus |
| `export.staged` | projectId, routes, liveWriteAttempted=false, blockerCount |
| `blocker.created` | projectId, blockerType, severity, source |
| `linear.sync.viewed` | projectId, linearProject, sourceOfTruth=true |

Solvys admin dashboard requirements:

- project/client registry with active shell configuration and current branch/ref;
- per-project usage metrics: views, commands, drawer opens, settings changes, staged runs;
- per-project blocker metrics: live access, approval, source, readback, legal/compliance;
- run health: latest local run id, evidence count, review status, dead-letter state;
- adoption signals: report rail opens, completed report views, export staging attempts;
- error inventory: failed packet load, failed export route, missing config, auth/session unavailable;
- deeper Solvys-1 control requirements: tenant registry, demo-control flags, production-domain preflight, preview-auth QA, and runtime command visibility.

## S11-T4 Local Runtime + Linear Sync

The browser shell stages local runtime work and records review events. It does not execute shell commands directly.

Command registry:

| Command | CWD | Mutates external system | Notes |
| --- | --- | --- | --- |
| `pnpm build` | `probate-lead-engine` | No | Full monorepo build gate. |
| `pnpm --filter @ple/worker test` | `probate-lead-engine` | No | Worker validation gate. |
| `pnpm --filter @ple/worker run:dry -- --address="20611 NW 33rd Pl, Miami Gardens, FL 33056" --owner="Fresh public-source lead"` | `probate-lead-engine` | No | Fresh public-source dry run. |
| `pnpm --filter @ple/artifact build` | `probate-lead-engine` | No | Copies artifact HTML to dist. |
| `pnpm --filter @ple/artifact dev` | `probate-lead-engine` | No live CRM mutation | Local artifact preview at `http://localhost:4173`. |
| `pnpm build` | `site-v2` | No | Public site build gate. |

Linear sync model:

```ts
export interface LinearSyncState {
  projectName: "HeirRight Deal Engine Automation";
  sourceOfTruth: true;
  sprint: "S11";
  parentIssue: "HEI-36";
  trackIssues: ["HEI-71", "HEI-72", "HEI-73", "HEI-74", "HEI-75"];
  localBranch: string;
  pushedRef?: string;
  blockers: ShellBlocker[];
}
```

Local storage boundary:

- OK: UI preference state, filled local report gaps, shell setting previews, drawer events.
- Not OK: real credentials, Podio tokens, Google tokens, private client CSV exports, paid-source data.
- External state changes must be performed by backend services with credentials and readback proof, not by browser-only shell code.

## S11-T5 Extraction + Solvys-1/Fintheon Hooks

Extraction should wait until HeirRight MVP validation proves the shell pattern. The first extraction boundary should be a small shared package/module, not a redesign of every app.

Readiness checklist:

- HeirRight operator shell is usable against real latest-run data.
- Settings controls map to a real qualification contract.
- Composer command events are stable and provider-agnostic.
- Activity drawer event shape supports ready/review/blocked state.
- Runtime command registry and Linear sync model are documented.
- Solvys admin analytics event inventory is accepted.
- No HeirRight-specific probate language leaks into shared components.

Proposed module boundary:

```text
packages/shell-core/
  config/
  commands/
  events/
  analytics/
  runtime/
  linear/
  guardrails/
```

Project-owned surfaces stay outside `shell-core`:

- HeirRight lead table, report rail, lead-quality copy, probate settings, export readiness copy.
- Solvys-1 tenant/admin controls, preview-auth surfaces, production-domain preflight.
- Fintheon trade/team/desk surfaces, future Teams integration hooks, financial compliance copy.

Fintheon hook note:

- Future Fintheon shell work can reuse composer, drawer, runtime, Linear, analytics, and guardrails.
- Fintheon must still own its desk-specific surface, Teams/collaboration context, and financial workflow language.

Migration plan:

1. Keep HeirRight artifact app as the validation host through MVP handoff.
2. Extract only event and config types first.
3. Move composer and drawer after two project implementations share the same interaction contract.
4. Move runtime/Linear registry after Solvys admin has a real registry view.
5. Leave project home screens, reports, tables, and settings copy project-owned.

## Completion Notes

S11 is complete locally when:

- the HeirRight artifact app renders the S11 shell surfaces;
- command composer and activity drawer work without live external mutation;
- lead-quality settings are visible and locally persisted;
- runtime and Linear panels state the correct boundary;
- Solvys analytics, runtime, Linear, and extraction contracts are documented;
- S9 remains plainly blocked on Podio access and readback proof.
