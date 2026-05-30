# HeirRight Zoom Onboarding Notes Synthesis

Status: user-supplied Zoom notes incorporated into planning  
Date incorporated: May 21, 2026  
Source posture: direct Zoom Docs access remains blocked; this synthesis is based on the pasted meeting notes supplied by Sam.

## Delivery Clock

Joshua leaves for Alaska on June 6, 2026 and expects to be unavailable until about June 20, 2026. The practical delivery plan should use this shape:

- MVP before June 6, with at least 2 days for Joshua to test.
- 80% finished product before the Alaska trip, with debugging/refinement continuing during the unavailable window.
- Full forward testing after Joshua returns.
- 30-day milestone: automate at least 60% of front-end qualified lead generation and lead report creation, plus text/email workflow scaffolding.
- 90-day milestone: full document prep automation and a functioning deal engine that creates qualified prospects with closing opportunities.

## CRM Decision Path

Podio remains the current client system, but integration is uncertain. The immediate plan should keep the lead engine behind a provider-neutral CRM adapter rather than assume Podio is the final CRM.

Decision path:

1. Treat Podio as the leading CRM path unless smoke tests disprove it.
2. Validate Podio API, hooks/webhooks, MCP access, item/task/comment/file operations, and readback behavior.
3. Build the lead engine as a Claude Cowork automation artifact that owns orchestration and talks directly to Podio.
4. Avoid Zapier as the core automation layer; use it only as a narrow bridge for a specific blocked action.
5. Use CSV export from Podio to protect current data and test fallback migration if needed.
6. Test Macro or Close only if Podio fails automation/readback/team-fit gates.

CRM notes:

- Podio is now the leading CRM path if it can close the workflow loop: CRM records, contacts, tasks, queues, reports, follow-ups, exports, hooks, MCP where acceptable, and API/readback.
- Macro and Close remain fallback candidates if Podio cannot support the sales workflow.
- Notion is not recommended as the operating CRM because it is too general-purpose for high-volume workflow and AI-agent modification.
- Slack can be considered as a lightweight workflow/context layer, but not as the default system of record.

## Lead Engine Requirements

Launch county:

- Miami-Dade only for the first deployment.
- Expand counties only after source reliability is proven.

Primary identifier:

- Estate name is the first column and primary lookup/search concept.
- Property address is secondary.

Lead buckets:

- Qualified leads: prospects that pass research checks and warrant active prospecting; currently managed in Google Sheets.
- Bonus leads: warm leads actively raising their hands and wanting to do business; currently added to Podio CRM.

Distribution:

- Support round-robin assignment to sales reps.
- A single opportunity may contain 4-5 contact numbers or multiple related contacts.

## Top Automation Priorities

Joshua's ranked priorities:

1. Basic property data collection
   Target 60-70% automation from Miami-Dade County Property Search: mailing addresses, taxes, deeds, legal descriptions, liens, and basic owner data.

2. Document preparation workflows
   Automate 10+ closing documents so a small input set populates required forms.

3. Follow-up sequences
   Build text/email workflow support for large volumes while preserving nuanced probate conversation handling.

4. Most recent recorded deeds
   Retrieve latest deed recordings for properties.

5. Liens recording
   Collect liens recorded on target properties.

## Website Sequence

Website redesign is real, but it should follow lead-engine delivery.

- Current website is considered dated.
- Start website after lead engine delivery, during forward testing.
- Present multiple artistic directions and 2-3 copy/layout drafts.
- Target one week for the website once started.

## Architecture Commitments

- Avoid Zapier or similar third-party bridges by default to avoid unnecessary recurring costs.
- Prefer direct APIs where possible.
- Use Browserbase-style automation only as a fallback for sites that cannot expose workable APIs.
- Design the system so future AI agents can patch behavior with minimal code ceremony.
- Keep the system useful from mobile/laptop workflows, not only a heavy desktop command center.

## Development Risk

Two-week MVP difficulty is moderate if scoped as assisted automation:

- property/deed/tax source depth;
- report generation;
- CRM dry-run or limited sync;
- document prep scaffolding;
- follow-up sequence design;
- dashboard and intake flow.

The riskiest items are live county extraction reliability, Podio write fidelity, paid-source permissions, and compliance approval for outreach automation.
