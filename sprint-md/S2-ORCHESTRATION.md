# Sprint Brief: S2-ORCH -- HeirRight Raw Dossier To CRM Adapter

Owner: TP  
Date: Wednesday, May 20, 2026  
Goal: make the raw dossier operational and CRM-ready through a provider-neutral adapter path.

## Tracks

| Issue | Title | Brief |
| --- | --- | --- |
| S2-T1 | Dossier Contract + Storage | `@sprint-md/S2-T1-dossier-contract-storage.md` |
| S2-T2 | CRM Adapter Contract | `@sprint-md/S2-T2-podio-crm-adapter.md` |
| S2-T3 | CRM Pipeline Model | `@sprint-md/S2-T3-podio-pipeline-model.md` |
| S2-T4 | Dossier Narrative Only | `@sprint-md/S2-T4-dossier-narrative-only.md` |
| S2-T5 | CRM Dry-Run Validation | `@sprint-md/S2-T5-crm-dry-run-validation.md` |

## Acceptance

- Raw dossier maps to provider-neutral CRM fields.
- Provider-specific gaps can be documented without changing the lead engine.
- Macro, Podio, Close, and dry-run modes can share the same adapter contract.
- CRM dry-run output is complete.
