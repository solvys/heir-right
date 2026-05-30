# Sprint Brief: S7-T4 -- CRM Field Expansion

Owner: TP
Parent: S7-ORCH
Dependencies: S7-T1, S7-T2

## Goal

Map report fields into CRM-ready fields without committing to a final CRM choice.

## Included Scope

- Estate name.
- Lead bucket.
- Owner type.
- Tax flags.
- Title/deed flags.
- Probate status.
- Family tree status.
- Lead-quality profile.
- Lead-quality reason codes.
- Offer math.
- Next action.
- Outreach readiness.

## Excluded Scope

- Final Macro vs Podio vs Close decision.
- Live CRM writes.

## Acceptance

- CRM payload can represent the completed lead report.
- CRM payload can represent quality signals without exposing internal scoring mechanics as client-facing "secret sauce."
- Validation-dependent CRM fields are flagged as pending mapping.
