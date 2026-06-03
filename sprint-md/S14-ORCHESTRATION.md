# Sprint Brief: S14-ORCH -- Daily Lead Production + Qualification

Owner: TP
Beta phase: 2.0 Beta
Branch: `sprint/S14-S15-heirright-2-beta-production-export`
Project: HeirRight Deal Engine Automation

## Goal

Make the daily run tell the truth about contract-volume fulfillment: counties searched, raw leads found, qualified leads counted, duplicates removed, dead letters captured, and blockers explained in operator language.

## Tracks

| Track | Title | Brief |
| --- | --- | --- |
| S14-T1 | Configurable Daily County Runs | `@sprint-md/S14-T1-configurable-daily-county-runs.md` |
| S14-T2 | Qualification Intelligence | `@sprint-md/S14-T2-qualification-intelligence.md` |

## Acceptance

- Daily runs can target configured counties.
- Duplicate, source-blocked, and placeholder-only records do not count as qualified.
- Output reports raw leads, qualified leads, blockers, dead letters, and missed-volume reasons.
