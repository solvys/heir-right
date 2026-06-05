# HeirRight Client Onboarding Questionnaire

Status: client intake draft  
Purpose: collect the access, workflow, compliance, and roadmap decisions needed to streamline HeirRight development.

## 0. Newly Supplied Onboarding Materials

1. We reviewed `HeirRight Workflow. pdf.pdf` and used it to expand the roadmap around the real "running the play" process.
2. The Zoom meeting notes link is not readable from our current session, but Sam supplied pasted notes and those notes are now incorporated in `docs/HEIRRIGHT_ZOOM_ONBOARDING_NOTES_SYNTHESIS.md`.
3. Please still export the Zoom Doc or update sharing so we have source provenance.
4. Please confirm whether the workflow PDF is approved as source-of-truth for product planning, or whether parts of it are historical/training-only.

## 1. Immediate Development Unblockers

These items are needed to move from local/dry-run behavior into a client-validated operating system.

### Access and Accounts

1. Who is the primary client decision-maker for product, workflow, and compliance approvals?
2. Who is the day-to-day operator who will review leads, documents, and CRM output?
3. Can you provide access or invite details for Podio?
   - Workspace name
   - App names
   - Existing field structure
   - Admin or API access level
   - Whether live writes are approved for testing
4. Can Joshua or the Podio admin approve a secure Podio access handoff for the verified Texas Equity Pros Leads app?
   - Workspace: Texas Equity Pros LLC
   - App: Leads
   - Confirm who can approve one clearly labeled test lead
   - Confirm who can confirm the test lead, note, and review task after it appears
5. If direct Podio access is unavailable, is an authenticated browser review acceptable only for field discovery and transition validation?
6. Do you have Cloudflare, Vercel, Railway, or another preferred hosting account for the demo and eventual production system?
7. Who will own production credentials after handoff?
8. Can Joshua create or invite a Podio account for Sam to test integration?
9. Should the test account use a company email or Google sign-in?
10. If Podio is not viable, is Macro approved as the first migration prototype?
11. If Macro is not viable, is Close CRM approved as the fallback migration prototype?
12. Can Joshua export Podio and Google Sheets data as CSV for sandbox migration testing?

### Source Data

1. Confirm the first county for launch. Current development assumes Miami-Dade County only.
2. What public source systems do your operators currently use?
   - Property appraiser
   - Official records / clerk
   - Probate court
   - Tax collector
   - GIS / parcel tools
   - Other internal or paid databases
3. Which lookup type is most common for your team?
   - Property address
   - Owner name
   - Folio / parcel number
   - Estate name *** They use Estate Name.
   - Case number
4. Do you have example leads that represent good, average, and bad opportunities?
5. Are there any sources we should avoid using, even if public?
6. Are paid enrichment vendors part of the roadmap after the first dry-run milestone?
7. Do you have existing lead files, exports, spreadsheets, or Podio data that we can use as fixtures?
8. Which workflow sources are approved for automation, manual tasking only, or out of scope?
   - Miami-Dade property appraiser
   - Official records / OR book-page
   - Tax collector / tax receipts
   - Civil/family/probate docket
   - Marriage license records
   - Broward records
   - Voter records
   - Professional licenses
   - Incarceration records
   - Code enforcement
   - Obituary / Findagrave / Legacy / Google
   - IDI
   - Intelius
   - Ancestry
   - ForeWarn
   - VitalChek
   - PI requests
9. Are company-owned properties always out of scope?
10. Is "recently sold within 5 years" always a disqualification rule?
11. Should 2+ years of unpaid taxes be treated as a priority signal, a review flag, or both?

### CRM and Workflow

1. What are the exact stages in the HeirRight pipeline today?
2. The current model uses Marketing, Acquisition, and Disposition. Does that match your real process?
3. What lead status values should exist in Podio?
4. What fields are mandatory before a lead can move out of initial review?
5. What fields are mandatory before outreach can begin?
6. What fields are mandatory before document generation?
7. What should count as a duplicate lead?
   - Same parcel
   - Same address
   - Same owner
   - Same estate
   - Same probate case
8. What tasks should be created automatically for a new raw dossier?
9. Who should own those tasks by default?
10. Should the system ever create live CRM items automatically, or should every sync require operator approval?
11. What current Podio fields and candidate Macro fields exist for estate name, owner type, disqualification reason, tax status, probate status, family tree status, offer math, and outreach readiness?
12. Should the CRM expose a research queue before Acquisition?
13. What are the exact handoff states between VA/researcher, Joshua/manager, underwriting, and document preparation?
14. Confirm the two lead buckets from the call:
    - qualified leads in Google Sheets;
    - bonus/warm leads in Podio.
15. Should round-robin distribution happen at qualified-lead creation, outreach-ready status, or bonus-lead creation?
16. How should one opportunity store 4-5 phone numbers or multiple related contacts?
17. How long should Podio and any new CRM run in parallel before sunset?
18. Who decides whether the team is ready to switch systems?

## 2. Lead Qualification and Business Rules

### Target Leads

1. What is the ideal HeirRight lead?
2. Which property types are in scope?
   - Single-family
   - Condo
   - Multifamily
   - Vacant land
   - Commercial
   - Mobile home
3. Which property types are out of scope?
4. What geography is in scope after Miami-Dade?
5. What estate, probate, or title signals matter most?
6. Which signals should create a review flag instead of a confident claim?
7. What makes a lead disqualified?
8. What makes a lead urgent?
9. What makes a lead high priority once scoring or ranking is later added?
10. Confirm the qualification rules from the workflow PDF:
    - individual owner continues;
    - company owner stops;
    - recently sold within 5 years stops;
    - adverse possession creates a review flag;
    - unpaid taxes for 2+ years creates a review/priority signal;
    - missing source evidence blocks outreach readiness.

### Offer and Deal Logic

1. What inputs are required before an offer can be drafted?
2. Do you have a standard offer formula?
3. Are there thresholds for minimum equity, value, lien amount, tax delinquency, or property condition?
4. Who approves offer assumptions?
5. Should offer calculations be excluded until a later phase?
6. Which offer/profit fields should be tracked at launch?
   - as-is value
   - taxes due
   - liens
   - mortgages
   - selling costs
   - probate costs
   - partition costs
   - post-equity value
   - number of heirs
   - equity per heir
   - buy percentage/value
   - offer amount
   - profit
   - minimum net profit

## 3. Document Automation

1. Which documents should be generated first?
   - Internal summary
   - Offer letter
   - Heir communication
   - Negotiation summary
   - Status update
   - Other
2. Which templates are current and approved for use?
3. Are any templates outdated or for reference only?
4. Which document fields must always be filled from source-backed data?
5. Which fields can remain as placeholders for human completion?
6. What language must appear on draft documents to prevent accidental external use?
7. Who must review documents before they are used externally?
8. Do you need PDF, Word, Google Docs, or HTML output first?
9. Are e-signature workflows in scope later?
10. Should the completed lead report be generated before any external offer letter?
11. Which parts of the "running the play" report are mandatory before document generation?
    - owner DOB/DOD
    - obituary links
    - probate status
    - marriage status
    - mortgages/liens
    - tax history
    - family tree hypothesis
    - contact placeholders
    - offer math
12. Are the provided scripts and offer templates approved for draft generation only, or approved for operational use?

## 4. Intake, Landing Page, and Operator Dashboard

### Intake

1. Who is the intake form for?
   - Internal operators
   - Sellers / heirs
   - Referral partners
   - Public landing page visitors
2. What fields should the intake form collect at launch?
3. Should intake create a dry-run lead only, or should it create a live CRM record?
4. Should intake trigger document generation?
5. Should intake trigger notifications?
6. Should estate name be the primary intake/search field for internal operators?
7. Should the intake support address-only, estate-name-only, folio-only, and case-number-only starts?

### Dashboard

1. What should an operator see first when opening a dossier?
2. Which review flags are most important?
3. What source links must be visible?
4. What actions should be available from the dashboard?
   - Approve dossier
   - Send to CRM adapter
   - Generate documents
   - Mark duplicate
   - Reject lead
   - Request manual research
5. Should the dashboard require login for the demo?
6. What reporting is needed for the first production version?
7. Should the dashboard show "running the play" steps as a checklist?
8. Which steps require human review before moving forward?
9. Which states should be visible as blocked/disqualified rather than hidden?

## 5. Compliance, Legal, and Approval Boundaries

1. Who provides legal/compliance review?
2. Are there restrictions on outreach to heirs, estates, owners, or family members?
3. Are there approved scripts or disclaimers for contact?
4. Are there sources, data types, or enrichment fields that should not be stored?
5. What audit trail is required for source facts, edits, CRM syncs, and document generation?
6. How long should lead and dossier records be retained?
7. Is live outreach explicitly out of scope for the first milestone?
8. What needs to happen before live outreach automation can be considered?
9. Are neighbor calls, relative calls, texts, emails, and offer letters approved only for manual use?
10. Who approves the outreach scripts in English and Spanish?
11. What disclaimers must appear on draft scripts, texts, emails, and offer letters?
12. Are there data retention limits for paid-source contact data and family tree information?

## 6. Roadmap Questions

These questions affect sprint order and product shape after the Friday dry-run milestone.

1. What is the single most important outcome after the first demo works?
   - More counties
   - Better source extraction
   - Live Podio sync
   - Document automation
   - Intake/landing conversion
   - Enrichment
   - Lead scoring
   - Outreach workflow
2. Should the next expansion be depth in Miami-Dade or a second county?
3. Which county should be next if expansion is approved?
4. When should paid enrichment enter the system?
5. Should AI be used for narrative summaries only, or should scoring/ranking be added later?
6. What are the acceptance criteria for a production-ready lead?
7. What are the acceptance criteria for a production-ready document packet?
8. What are the acceptance criteria for a production-ready CRM sync?
9. What manual steps are acceptable long term?
10. What manual steps must be automated as soon as possible?
11. What does success look like 30 days after launch?
12. What does success look like 90 days after launch?
13. After the Friday dry run, should the next sprint prioritize:
    - tax/deed extraction depth;
    - probate/heirship research;
    - completed lead report generation;
    - offer math;
    - Podio field expansion;
    - outreach draft library;
    - production hosting/security?
14. Confirm the delivery clock:
    - MVP before June 6, 2026;
    - at least 2 days for Joshua to test before Alaska;
    - June 6-20 used for debugging/refinement;
    - forward testing resumes after Joshua returns.
15. Confirm the 30-day success metric: automate at least 60% of front-end qualified lead generation and lead report creation plus text/email workflow scaffolding.
16. Confirm the 90-day success metric: full document prep automation and a functioning deal engine generating qualified prospects with closing opportunities.

## 7. Client Assets Needed

Please provide or confirm:

- Current Podio workspace/app access or screenshots.
- Current pipeline stages and status values.
- Current document templates.
- Current intake forms, landing pages, or ad traffic sources.
- Sample leads from past deals.
- Sample rejected/disqualified leads.
- Any existing spreadsheets or exports.
- Podio CSV export.
- Google Sheets export for qualified leads.
- Macro CRM access if migration prototype is approved.
- Close CRM access if Macro fails and fallback testing is approved.
- Completed lead report examples.
- Current offer/profit spreadsheet or calculator.
- Current outreach scripts and approved disclaimers.
- Paid-source account list and permitted storage rules.
- Current website assets and examples of preferred website style.
- Brand assets: logo, colors, fonts, contact info, disclaimers.
- Hosting/account preference.
- Compliance/legal reviewer contact.
- Production owner for credentials and billing.

## 8. Decisions We Need From The Client

1. Confirm Miami-Dade as the first county.
2. Confirm whether live Podio writes are allowed during testing.
3. Confirm whether browser automation is acceptable if direct Podio API access is blocked.
4. Confirm document templates approved for draft generation.
5. Confirm that live outreach remains excluded from the first milestone.
6. Confirm the first production hosting target.
7. Confirm who signs off on source reliability, CRM mapping, document language, and production launch.
8. Confirm whether the workflow PDF is the current source-of-truth.
9. Provide readable Zoom meeting notes or confirm they are superseded.
10. Confirm paid/manual source approvals and compliance limits.
11. Confirm who approves outreach script use.
12. Confirm whether Macro CRM is approved as the first migration candidate.
13. Confirm whether Close CRM is approved as fallback if Macro or Podio fails validation.
13. Confirm whether website redesign starts only after lead-engine delivery.

## 9. Current Development Assumptions To Validate

- First milestone is a local/dry-run system, not a live outreach platform.
- Miami-Dade is the initial county.
- Public-source property-first search is the first input path.
- Every dossier claim must have a source reference or a visible review flag.
- CRM integration should stay provider-neutral through the adapter.
- Podio is the leading CRM path if API/MCP/hooks/readback smoke tests pass.
- Macro is the first fallback candidate if Podio cannot close the workflow loop.
- Close CRM is the likely fallback if Podio or Macro is not integration-friendly.
- Podio and a replacement CRM can run in parallel during transition only if fallback migration becomes necessary.
- Missing credentials block live sync but should not block dry-run payload generation.
- Internal summary is the first document output.
- All generated documents are drafts requiring human review.
- Enrichment, AI scoring, new counties, and live outreach are later-phase work unless explicitly re-added.
- Estate name is a primary input path.
- Company-owned properties and properties sold within 5 years default to disqualified/review states.
- 2+ years unpaid taxes is a meaningful workflow signal.
- Outreach scripts are draft reference material only until approval.
