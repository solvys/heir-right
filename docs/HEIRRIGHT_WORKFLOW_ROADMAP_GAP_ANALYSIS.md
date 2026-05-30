# HeirRight Workflow Roadmap Gap Analysis

Status: planning update from workflow PDF and user-supplied Zoom notes  
Source reviewed: `HeirRight Workflow. pdf.pdf`  
Zoom notes status: direct Zoom Docs access blocked on May 21, 2026; pasted notes incorporated afterward

## Access Notes

The Zoom Hub document at `https://hub.zoom.us/doc/pyeWoASdRpyhp_8YFjZ7nw?from=hub&skipCheck=1` loaded only the public Zoom Docs shell. Direct file lookup returned `REASON_PERMISSION_DENIED`, and content APIs returned unauthorized/no-permission responses. Sam later pasted the Zoom note content into the working thread, so the planning docs now include a user-supplied Zoom synthesis. Keep direct Zoom export/share access as a provenance blocker, not a product blocker.

Related note:

- `docs/HEIRRIGHT_ZOOM_ONBOARDING_NOTES_SYNTHESIS.md`

## Workflow Truth From The PDF

HeirRight's real operator workflow is not just property search. It is a staged investigation play:

- qualify the property owner first;
- stop if the property is company-owned;
- stop if the property sold within the last 5 years;
- check recent deeds, OR book/page, adverse possession, mailing addresses, and ownership activity;
- check tax history, 2+ years unpaid taxes, reassessments, receipt status, and who paid taxes;
- search civil, family, probate, official records, and marriage licenses;
- use estate-name search as a primary lookup path;
- build a backstory and family tree before outreach;
- collect probate status, affidavits of heirs, obituary links, DOB/DOD, mailing addresses, mortgages, liens, and unpaid taxes;
- keep paid enrichment and manual investigation sources separate from public-source automation;
- produce a completed lead report with offer/profit math and per-heir equity;
- move into calls/texts/emails only after enough research is gathered and compliance boundaries are approved.

## Immediate Roadmap Deltas

The Friday dry-run scope stays valid, but the next planning layer needs sharper phases:

1. Workflow rule capture
   Encode stop/continue rules for individual owner, company owner, recent sale, adverse possession, unpaid taxes, and missing source evidence.

2. Estate-name and probate-first search
   Promote estate-name lookup from an intake question into a first-class input path alongside address, owner, folio, and case number.

3. Tax and ownership history
   Add a tax-history adapter/work queue that tracks 2+ years unpaid taxes, reassessment changes, tax receipt status, and payer identity.

4. Probate/heirship research queue
   Add a research layer for civil/family/probate docket status, affidavit of heirs, marriage licenses, obituaries, death indicators, voter records, incarceration status, and professional licenses.

5. Manual and paid-source governance
   Treat IDI, Intelius, Ancestry, ForeWarn, VitalChek, PI requests, door knocks, and code-enforcement calls as credentialed/manual workflows unless the client explicitly approves automation.

6. Completed lead report
   Generate a structured report that includes all "running the play" steps, evidence, missing data, family tree hypothesis, contact placeholders, and offer math inputs.

7. Outreach script library
   Store scripts and templates as draft assets with review gates. Do not automate calls, texts, emails, or neighbor outreach until compliance approval exists.

## Planning Blockers To Resolve

- Direct Zoom meeting notes still need accessible export or share permissions for source provenance.
- Client needs to confirm which paid/manual sources are approved for storage or automation.
- Client needs to confirm current Podio export/field shape and then validate whether Macro can represent estate name, family tree, outreach status, and offer/profit math.
- Client needs to confirm whether outreach scripts are approved reference material or active workflow content.
- Client needs to confirm who signs off on probate/legal language before any external document or message is used.
