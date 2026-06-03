# HeirRight Site V2 Launch QA

Status: S10-T5 passed with launch approval notes
Last updated: 2026-06-03
Branch: `codex/heirright-2026-06-03-s10-complete`
Site app: `/Users/tifos/Documents/Codebases/heir-right/site-v2`

## Build Result

```bash
cd /Users/tifos/Documents/Codebases/heir-right/site-v2
pnpm build
```

Passed. Vite built the production site with TypeScript clean.

## Visual Direction

Selected direction: **Civic Ledger**

Implemented posture:

- Public site now leads with "Inherited Property Review."
- Hero copy keeps the S10-T3 line: "Untangle the estate. Keep the next step clear."
- The page explains title, taxes, liens, probate, heirs, and next-step review without promising an automatic offer.
- Visual system uses the warm editorial Civic Ledger tone with a generated property-review dossier image.

Generated image source:

- Built-in Image Gen output copied from `/Users/tifos/.codex/generated_images/019e8e3a-b61a-7b91-9a13-1255562408b5/ig_05b97b0c14769e33016a205466dc008190911ebb728633db8f.png`
- Workspace asset: `/Users/tifos/Documents/Codebases/heir-right/site-v2/public/assets/property-review-dossier.png`

## Browser / Render QA

Direct Browser tooling was not exposed in this session, so Playwright was used as the fallback.

Desktop viewport:

- Viewport: `1440 x 1100`
- No horizontal overflow.
- Hero brand, offer, CTAs, image, proof row, and next-section hint were visible.
- H1: `Inherited Property Review`
- First next-section top: `946px`, leaving next-section content visible.

Mobile viewport:

- Viewport: `390 x 1100`
- No horizontal overflow.
- Nav height: `58px`
- H1 top: `225px`
- First next-section top: `968px`, leaving next-section content visible.
- The mobile nav inset issue found during QA was fixed before closeout.

## Link QA

All internal anchors resolved:

- `#top`
- `#review`
- `#process`
- `#fit`
- `#questions`
- `#contact`

External/contact links present:

- `tel:+17869623457`
- `https://heirright.com/#get_your_offer`

Asset URLs returned `200 OK` locally:

- `/assets/property-review-dossier.png`
- `/assets/og-image.jpg`
- `/robots.txt`
- `/sitemap.xml`

## Intake QA

The preview intake form accepts:

- name
- phone
- property address
- review notes

Submit behavior:

- Does not write to CRM.
- Does not send outreach.
- Displays: "Review request prepared. Next step: call HeirRight or use the current consultation form to submit the details."
- Keeps the approved path visible through `https://heirright.com/#get_your_offer`.

Launch approval note:

- Before production launch, connect the form to the approved intake destination and follow-up owner, or intentionally keep the existing consultation-form bridge.

## SEO / Metadata QA

Present:

- `<title>HeirRight | Inherited Property Review</title>`
- meta description
- theme color
- Open Graph title
- Open Graph description
- Open Graph image
- `robots.txt`
- `sitemap.xml`

Recommended before production launch:

- Confirm final canonical domain behavior in hosting config.
- Confirm whether the Open Graph image should remain the existing `og-image.jpg` or be replaced with the Civic Ledger dossier asset.

## HeirRight Approval Notes

Still needs operator/client approval before production launch:

- Intake destination and follow-up owner.
- Whether Texas remains in the public market story.
- Whether testimonial quotes should be added.
- Whether founder-faith language should be included, moved to a secondary page, or omitted.
- Final disclaimer language for attorney-fee support and consultation claims.

## Verdict

S10-T5 result: **passed with launch approval notes**.

The site is locally buildable, responsive, render-checked, and ready for production-deployment prep once the intake destination and final public-claim approvals are confirmed.
