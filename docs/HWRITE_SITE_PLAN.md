# HWRITE Site Plan

Status: BOS-2026-05 T3 local artifact
Last updated: 2026-06-06
Branch: `v2.0.1/heirright-2026-06-06-run-point`
Primary surface: `site-v2/`

## Purpose

The HWRITE site is the simple public HeirRight outreach surface. It should help families understand what HeirRight reviews before a sale, without making the site feel like a product marketplace or a complex Fintheon-style scrollytelling demo.

The current implementation lives in `site-v2/` and already supports the BOS direction: a mobile-first inherited-property review page, clear proof/process sections, and a guarded review-request form.

## Source Anchors

- BOS brief: `/Users/tifos/Documents/Codex/2026-05-22/codex-handoff-bookmark-opportunity-strategy-date/plans/BOS-2026-05-T3-hwrite-site-logo.md`
- BOS source index: `/Users/tifos/Documents/Codex/2026-05-22/codex-handoff-bookmark-opportunity-strategy-date/plans/BOS-2026-05-SOURCE-INDEX.md`
- Website intake: `docs/HEIRRIGHT_WEBSITE_CONTENT_INTAKE.md`
- Copy and layout drafts: `docs/HEIRRIGHT_SITE_COPY_LAYOUT_DRAFTS.md`
- Launch QA: `docs/HEIRRIGHT_SITE_LAUNCH_QA.md`
- Current public-site implementation: `site-v2/index.html`
- Current form endpoint: `site-v2/api/review-request.js`

## Site Role

The site should do four jobs:

1. Explain that HeirRight reviews inherited property problems before pushing an offer.
2. Show the specific issues the team can review: title, taxes, liens, probate, and heirs.
3. Give families a simple way to request a property review or call the team.
4. Keep all claims review-safe: no automatic offer, no legal advice, no guaranteed result, no automated outreach.

## Current Section Plan

The implemented `site-v2/index.html` follows this structure:

1. Header
   - Brand, simple anchors, and request-review CTA.
2. Hero
   - "Inherited Property Review" headline.
   - Plain promise: untangle the estate and keep the next step clear.
   - CTA pair: request review and call 786-962-3457.
   - Proof chips: team-led review, title/tax questions, South Florida focus.
3. Where Families Get Stuck
   - Title questions.
   - Taxes and receipts.
   - Liens or recorded claims.
   - Probate and heirs.
4. The HeirRight Review
   - Share the property.
   - Review the records.
   - Outline options.
5. Fit Check
   - Inherited house, multiple heirs, back taxes, title friction, vacant property, probate questions, liens/notices, unclear next step.
6. Proof
   - Team-led guidance.
   - Problem-property focus.
   - No automatic offer claim.
7. Contact / Intake
   - Review-request form.
   - Phone link.
   - Existing live form fallback.
   - Receipt-only submission language.

## Public Form Boundary

The review-request flow is intentionally guarded:

- Required fields: name, phone, email, property address, review notes.
- Honeypot field for obvious spam.
- Local receipt response.
- Optional webhook forwarding only when `HEIRRIGHT_DEMO_FORM_WEBHOOK_URL` is configured.
- No texts, emails, offers, live Podio writes, or outreach happen automatically.

Production launch still needs an approved destination for review requests: webhook, inbox, CRM handoff, or no production submit until launch approval.

## Content Rules

Use this public language:

- "Request a property review."
- "Review title, taxes, liens, probate, and heir questions."
- "Outline the next step."
- "Free review does not mean every property is ready for an offer."
- "HeirRight can help families understand the path before deciding what to do."

Avoid:

- "Instant offer."
- "Guaranteed sale."
- "Legal advice."
- "We resolve probate."
- "AI lead engine."
- "Dashboard."
- "Automation."
- Any claim that a form submit creates outreach, CRM action, or a binding review.

## Implementation Plan

1. Keep `site-v2/` as the site home for this BOS track.
2. Keep the current page as a single-page outreach site until client review changes the structure.
3. Add only lightweight visual depth. Do not bring in a heavy Three.js scrollytelling treatment for HeirRight.
4. Connect the form only after TP/Sam chooses the approved production destination.
5. Before launch, re-run:

```bash
cd /Users/tifos/Documents/Codebases/heir-right/site-v2
pnpm build
```

6. For repo-wide HeirRight confidence, re-run:

```bash
cd /Users/tifos/Documents/Codebases/heir-right/probate-lead-engine
pnpm build
pnpm test
```

## Open Decisions

- Approved production destination for review requests.
- Whether Texas remains public market copy or becomes secondary proof.
- Approved disclaimer language for attorney-fee and consultation claims.
- Approved testimonial/review quotes.
- Final logo asset package; current demo mark is the HR Monogram in `docs/HWRITE_VISUAL_DIRECTION.md`.

## Acceptance Checklist

- Site structure is drafted and implemented in `site-v2/`.
- Outreach use case is obvious in the first viewport.
- Proof and process sections are clear.
- Review-request flow is receipt-only until a production destination is approved.
- No product-marketplace, generic AI SaaS, or heavy scrollytelling posture is introduced.
