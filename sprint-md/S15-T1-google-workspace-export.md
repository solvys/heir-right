# Sprint Brief: S15-T1 -- Google Workspace Export

Branch: `sprint/S14-S15-heirright-2-beta-production-export`

## Intent

Export the completed report package to Google Workspace so the HeirRight team gets a clean report document and tracking row before manual outreach.

## Scope

- Create a Drive folder for the report package.
- Create a Google Doc inside that folder and write the completed report body.
- Append a tracking row to the configured Sheet.
- Read back the report file so success is proven.

## Out Of Bounds

- Export success without credentials.
- Live outreach or automatic contact.

## Validation

```bash
cd probate-lead-engine
pnpm --filter @ple/worker export:dry
```
