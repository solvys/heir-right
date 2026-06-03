# Sprint Brief: S13-T1 -- Streamdown Report Rail

Branch: `sprint/S12-S13-heirright-2-beta-access-ui`

## Intent

Use the worker's existing Streamdown-rendered report output inside the right rail so operators review the same report that can later export to Google Workspace or Podio.

## Scope

- Keep `completedLeadReport.formats.html` as the preferred report rail source.
- Label the iframe as a Streamdown-rendered report preview.
- Preserve sandboxed iframe behavior.

## Out Of Bounds

- Adding a second Markdown renderer.
- Live export calls.

## Validation

```bash
cd probate-lead-engine
rm -rf apps/artifact/dist
pnpm --filter @ple/artifact build
```
