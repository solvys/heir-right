# HWRITE Visual Direction

Status: BOS-2026-05 T3 local artifact
Last updated: 2026-06-06
Primary surface: `site-v2/`

Source index: `/Users/tifos/Documents/Codex/2026-05-22/codex-handoff-bookmark-opportunity-strategy-date/plans/BOS-2026-05-SOURCE-INDEX.md`

## Direction Name

Civic Ledger.

This direction is already reflected in the current `site-v2/` implementation. It presents HeirRight as a careful inherited-property review team: credible, human, and specific to estate friction.

## Visual Principles

- Lead with the property and the records, not a generic cash-buyer pitch.
- Use warm, stable colors that feel like estate files, title records, and local real estate work.
- Keep the page simple enough for a family member to understand quickly on mobile.
- Use visual polish to build trust, not to make the site feel like software.
- Keep HeirRight lighter than Fintheon or Priced In. No full product cockpit, no dense market-desk treatment, no heavy 3D.

## Palette

Current site tokens:

| Token | Color | Use |
| --- | --- | --- |
| Paper | `#f7f5f0` | Page background and calm first impression. |
| Ink | `#171614` | Main text. |
| Deep green | `#0f2a24` | Hero overlay, primary buttons, brand mark body. |
| Record blue | `#32495a` | Hover and secondary emphasis. |
| Copper | `#b86b44` | Brand mark outline and warm proof accents. |
| Sage | `#d8e0da` | Soft supporting surfaces. |
| Soft paper | `#ece7df` | Section backgrounds and quiet contrast. |

The palette should not collapse into beige-only or green-only. Use copper and record blue as supporting accents so the site feels like a premium real estate review, not a template.

## Type

Current site type:

- Serif: Georgia / Times New Roman fallback for large headings.
- Sans: Avenir Next / Segoe UI / Arial fallback for navigation, body, forms, and buttons.

Rules:

- Keep hero type large only in the hero.
- Use tight, readable section headings below the first viewport.
- Avoid narrow negative letter spacing.
- Keep button copy short and plain.

## Layout

The site should stay one page for now:

- Fixed, compact nav.
- Full-bleed first viewport with real property-review imagery.
- Clear problem blocks.
- Three-step process.
- Fit-check grid.
- Proof cards.
- Review-request form.

Cards should be reserved for repeated proof/problem items. Page sections should stay full-width bands or unframed layouts.

## Image Direction

Use images that show the actual review domain:

- inherited-property folders;
- property photos;
- tax receipts;
- deed/title notes;
- family-tree or heir notes;
- South Florida residential context.

Avoid:

- abstract AI gradients;
- dark, blurry office stock;
- generic happy-homebuyer imagery;
- computer dashboard screenshots as the first impression.

## Logo Direction Board

The current inline mark in `site-v2/index.html` is a good first concept: a shield/house/key hybrid. It works because it carries protection, property, and access without overexplaining the workflow.

### Concept A - Estate Shield

Use a shield outline with a roofline and simple key stem inside.

- Best for: trust, protection, complicated title and heir issues.
- Keep: copper outer stroke, deep green interior linework.
- Avoid: badge-heavy law-firm styling or anything that looks like official government certification.

### Concept B - Ledger House

Use a simple house shape sitting over two ledger lines.

- Best for: record review, tax/title documents, practical estate cleanup.
- Keep: squared, clean, small enough for mobile nav.
- Avoid: too many lines, courthouse columns, seals, or legal-credential signals.

### Concept C - Path Key

Use a key silhouette where the teeth form a small roof or doorway.

- Best for: "clear next step" positioning.
- Keep: very simple geometry and strong single-color use.
- Avoid: locksmith cues or luxury-real-estate flourishes.

Recommended next step: keep Concept A for the current site and test Concept B only if the team wants the site to feel more records-first than protective.

## Admin Shell Fit

The public logo should also work inside HWRITE admin surfaces:

- 32-40 px nav mark.
- Single-color version for dark or light sidebars.
- No tiny text inside the mark.
- Readable when paired with "HeirRight" or "HWRITE".
- Avoid marks that imply legal certification, guaranteed probate resolution, or official county status.

## Motion

Use small transitions only:

- nav background on scroll;
- hover lift on primary buttons;
- smooth anchor scrolling unless reduced motion is requested;
- form status changes.

Do not add heavy scroll choreography unless the public site later moves into a larger campaign. HWRITE should stay simple, fast, and review-focused.

## Accessibility And Mobile

- Minimum viewport: 320 px.
- Form fields must keep full width on mobile.
- Buttons need stable height and enough tap area.
- Link colors must remain readable after visited/focus states.
- Reduced-motion users should not get animated scroll behavior.
- No horizontal overflow on mobile.

## Final Direction

Use Civic Ledger with the Estate Shield mark unless TP/Sam requests a warmer family-first direction. This is the shortest path to a credible HeirRight public site that matches the existing operator workflow.
