# Sprint Brief: S2-T2 -- CRM Adapter Contract

Owner: TP  
Parent: `S2-ORCH`  
Dependencies: S2-T1

Implement the provider-neutral CRM adapter contract first, with Podio dry-run behavior as the current incumbent path and Macro/Close as validation-gated providers.

Acceptance:

- CRM dry-run output includes provider model, fields, tasks, missing config, and fallback requirements.
- Adapter contract supports dry-run, sync, readback verification, and config discovery.
- Provider payload can represent Macro, Podio, Close, or dry-run.
- Live sync is blocked unless credentials, target workspace, and field mapping are validated.
