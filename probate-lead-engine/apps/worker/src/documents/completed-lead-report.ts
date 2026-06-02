import type {
  CompletedLeadReport,
  ContactPlaceholderEntry,
  LeadBucket,
  LeadQualityProfile,
  OfferProfitField,
  RawDossier,
  ReportReviewGate,
  ResearchStepChecklistItem,
  ReviewFlag,
  SourceKey,
} from "@ple/types";
import { nowIso, slug } from "../lib";
import { renderMarkdownWithStreamdown } from "../markdown/render-streamdown";
import { buildOfferProfitMath } from "../reports/offer-profit-math";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function uniqueFlags(flags: ReviewFlag[]): ReviewFlag[] {
  return Array.from(new Set(flags));
}

function claimText(value: unknown, fallback = "Needs review"): string {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== null && item !== undefined && item !== "")
      .map(([key, item]) => `${key}: ${String(item)}`);
    return entries.length ? entries.join("; ") : fallback;
  }
  return String(value);
}

function formatMoney(field: OfferProfitField): string {
  if (field.value === null) return field.note ?? "Needs review";
  return `${field.currency} ${field.value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatPercent(field: OfferProfitField): string {
  if (field.value === null) return "Needs review";
  return `${field.value}%`;
}

function humanStatus(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildLeadBucket(dossier: RawDossier): LeadBucket {
  if (dossier.operatorQueue.state === "disqualified" || dossier.workflow.status === "stop") return "disqualified";
  if (dossier.operatorQueue.state === "manual_review" || dossier.workflow.status === "review_required") return "review_required";
  const enabledWeight = dossier.workflow.leadQuality.enabledSignals.length;
  if (enabledWeight < dossier.workflow.leadQuality.minEnabledSignalWeightForPromotion) return "generic_seed";
  if (dossier.workflow.leadQuality.reasonCodes.some((code) => code.includes("WARM") || code.includes("BONUS"))) return "bonus_warm";
  return "qualified";
}

function buildLeadQualityProfile(dossier: RawDossier): LeadQualityProfile {
  const settings = dossier.workflow.leadQuality;
  const enabledSignals = settings.signals.filter((signal) => signal.enabled).map((signal) => signal.label);
  const missingSignals = settings.signals
    .filter((signal) => signal.enabled && signal.requiresSourceEvidence)
    .filter((signal) => !settings.reasonCodes.includes(signal.reasonCode))
    .map((signal) => signal.label);
  const leadBucket = buildLeadBucket(dossier);

  return {
    model: settings.model,
    leadBucket,
    enabledSignals,
    missingSignals,
    reasonCodes: Array.from(new Set([...settings.reasonCodes, ...dossier.operatorQueue.reasonCodes])),
    promotionEligible: leadBucket === "qualified" || leadBucket === "bonus_warm",
    reviewFlags: uniqueFlags([
      ...dossier.workflow.reviewFlags,
      ...(leadBucket === "generic_seed" ? (["MISSING_LEAD_QUALITY_SIGNAL"] as ReviewFlag[]) : []),
      ...(leadBucket === "disqualified" ? (["HUMAN_REVIEW_REQUIRED"] as ReviewFlag[]) : []),
    ]),
  };
}

function buildReviewGate(dossier: RawDossier, offerReviewFlags: ReviewFlag[]): ReportReviewGate {
  const blocked = dossier.workflow.status === "stop"
    || dossier.operatorQueue.state === "disqualified"
    || dossier.operatorQueue.state === "blocked";

  return {
    reportStatus: "internal_draft",
    underwritingStatus: offerReviewFlags.includes("MISSING_OFFER_MATH_FACT") ? "draft" : "pending_review",
    documentReadiness: "draft_only",
    outreachReadiness: blocked ? "blocked" : "pending_review",
    externalUseBlocked: true,
    reviewerPlaceholder: "Assign operator reviewer before external use.",
    approvalPlaceholder: "Compliance/operator approval required before outreach or offers.",
    reviewFlags: uniqueFlags([
      "REPORT_REVIEW_REQUIRED",
      "HUMAN_REVIEW_REQUIRED",
      "OUTREACH_BLOCKED",
      ...offerReviewFlags,
      ...dossier.audit.reviewFlags,
    ]),
  };
}

function buildResearchChecklist(dossier: RawDossier): ResearchStepChecklistItem[] {
  const step = (input: {
    code: string;
    label: string;
    complete: boolean;
    partial: boolean;
    note: string;
    sourceRefs: ResearchStepChecklistItem["sourceRefs"];
    reviewFlags: ReviewFlag[];
  }): ResearchStepChecklistItem => ({
    code: input.code,
    label: input.label,
    status: input.complete ? "complete" : input.partial ? "partial" : "missing",
    note: input.note,
    sourceRefs: input.sourceRefs,
    reviewFlags: input.reviewFlags,
  });

  return [
    step({
      code: "PROPERTY",
      label: "Property appraiser search",
      complete: dossier.property.address.value !== null && dossier.property.parcelId.value !== null,
      partial: dossier.property.address.value !== null || dossier.property.ownerName.value !== null,
      note: claimText(dossier.property.address.value, "Property address still missing."),
      sourceRefs: dossier.property.address.sourceRefs,
      reviewFlags: dossier.property.address.reviewFlags,
    }),
    step({
      code: "TAX",
      label: "Tax history review",
      complete: dossier.taxHistory.unpaidYears.value !== null && dossier.taxHistory.amountDue.value !== null,
      partial: dossier.taxHistory.sourceStatus.value !== null,
      note: claimText(dossier.taxHistory.sourceStatus.value, "Tax history requires operator capture."),
      sourceRefs: dossier.taxHistory.sourceStatus.sourceRefs,
      reviewFlags: dossier.taxHistory.reviewTasks.flatMap((task) => task.reviewFlags),
    }),
    step({
      code: "DEED",
      label: "Deed / OR book-page review",
      complete: dossier.deedHistory.latestDeed.value !== null && dossier.deedHistory.orBookPage.value !== null,
      partial: dossier.deedHistory.sourceStatus.value !== null,
      note: claimText(dossier.deedHistory.sourceStatus.value, "Deed evidence incomplete."),
      sourceRefs: dossier.deedHistory.sourceStatus.sourceRefs,
      reviewFlags: dossier.deedHistory.reviewTasks.flatMap((task) => task.reviewFlags),
    }),
    step({
      code: "PROBATE",
      label: "Probate / civil / family docket",
      complete: dossier.probateDocket.caseNumber.value !== null && dossier.probateDocket.caseStatus.value !== null,
      partial: dossier.probateDocket.sourceStatus.value !== null,
      note: claimText(dossier.probateDocket.sourceStatus.value, "Probate docket facts pending."),
      sourceRefs: dossier.probateDocket.sourceStatus.sourceRefs,
      reviewFlags: dossier.probateDocket.reviewTasks.flatMap((task) => task.reviewFlags),
    }),
    step({
      code: "MARRIAGE_DEATH",
      label: "Marriage + death indicators",
      complete: dossier.marriageDeathIndicators.dateOfDeath.value !== null || dossier.marriageDeathIndicators.obituaryLink.value !== null,
      partial: dossier.marriageDeathIndicators.sourceStatus.value !== null,
      note: claimText(dossier.marriageDeathIndicators.sourceStatus.value, "Marriage/death research incomplete."),
      sourceRefs: dossier.marriageDeathIndicators.sourceStatus.sourceRefs,
      reviewFlags: dossier.marriageDeathIndicators.reviewTasks.flatMap((task) => task.reviewFlags),
    }),
    step({
      code: "FAMILY_TREE",
      label: "Family tree hypothesis",
      complete: (dossier.familyTree.hypothesis.value?.nodes.length ?? 0) > 0,
      partial: dossier.familyTree.sourceStatus.value !== null,
      note: `${dossier.familyTree.hypothesis.value?.nodes.length ?? 0} relationship nodes recorded as hypothesis only.`,
      sourceRefs: dossier.familyTree.hypothesis.sourceRefs,
      reviewFlags: dossier.familyTree.reviewTasks.flatMap((task) => task.reviewFlags),
    }),
    step({
      code: "CONTACTS",
      label: "Contact placeholders",
      complete: (dossier.familyTree.hypothesis.value?.nodes.some((node) => node.contactPlaceholder) ?? false),
      partial: (dossier.familyTree.hypothesis.value?.nodes.length ?? 0) > 0,
      note: "Contact placeholders remain draft until enrichment or manual capture.",
      sourceRefs: dossier.familyTree.hypothesis.sourceRefs,
      reviewFlags: ["NO_ENRICHMENT_RUN", "HUMAN_REVIEW_REQUIRED"],
    }),
    step({
      code: "OFFER_MATH",
      label: "Offer / profit underwriting",
      complete: false,
      partial: dossier.taxHistory.amountDue.value !== null,
      note: "Offer math remains draft until operator confirms as-is value and heir count.",
      sourceRefs: dossier.taxHistory.amountDue.sourceRefs,
      reviewFlags: ["MISSING_OFFER_MATH_FACT", "UNDERWRITING_REVIEW_REQUIRED"],
    }),
  ];
}

function buildContactPlaceholders(dossier: RawDossier): ContactPlaceholderEntry[] {
  const nodes = dossier.familyTree.hypothesis.value?.nodes ?? [];
  if (!nodes.length) {
    return [{
      role: "primary_heir",
      phones: [],
      emails: [],
      addresses: [],
      note: "No heir contact placeholders yet. Build family tree hypothesis first.",
      reviewFlags: ["NO_ENRICHMENT_RUN", "HUMAN_REVIEW_REQUIRED"],
    }];
  }

  return nodes.map((node) => ({
    role: node.role,
    name: node.name,
    phones: [],
    emails: [],
    addresses: node.contactPlaceholder ? [node.contactPlaceholder] : [],
    note: node.contactPlaceholder ?? "Contact placeholder pending enrichment or manual capture.",
    reviewFlags: uniqueFlags([...node.reviewFlags, "NO_ENRICHMENT_RUN", "HUMAN_REVIEW_REQUIRED"]),
  }));
}

function buildSourceLinks(dossier: RawDossier): Array<{ label: string; url?: string; source: SourceKey }> {
  const links = new Map<string, { label: string; url?: string; source: SourceKey }>();
  for (const fact of dossier.audit.facts) {
    if (!fact.sourceUrl) continue;
    const key = `${fact.source}:${fact.sourceUrl}`;
    if (!links.has(key)) {
      links.set(key, {
        label: `${fact.source} search`,
        url: fact.sourceUrl,
        source: fact.source,
      });
    }
  }
  for (const link of dossier.probateDocket.officialRecordCrossLinks.value ?? []) {
    if (!link.url) continue;
    links.set(link.url, { label: link.label, url: link.url, source: "official_records" });
  }
  return Array.from(links.values());
}

function buildMissingData(dossier: RawDossier, offerMath: CompletedLeadReport["offerMath"]): string[] {
  const missing: string[] = [];
  if (!dossier.property.address.value) missing.push("Property address");
  if (!dossier.property.parcelId.value) missing.push("Parcel/folio");
  if (!dossier.taxHistory.amountDue.value) missing.push("Tax amount due");
  if (!dossier.deedHistory.latestDeed.value) missing.push("Latest deed record");
  if (!dossier.probateDocket.caseNumber.value) missing.push("Probate case number");
  if (!dossier.marriageDeathIndicators.dateOfDeath.value) missing.push("Date of death");
  if (!dossier.familyTree.hypothesis.value?.nodes.length) missing.push("Family tree hypothesis nodes");
  if (offerMath.asIsValue.value === null) missing.push("As-is value");
  if (offerMath.heirCount.value === null) missing.push("Confirmed heir count");
  return missing;
}

function buildBackstory(dossier: RawDossier): string {
  const parts = [
    dossier.narrative,
    dossier.deedHistory.adversePossessionSignal.value === false
      ? "No adverse possession signal is currently recorded."
      : "Adverse possession status requires operator review.",
    dossier.taxHistory.receiptStatus.value
      ? `Tax receipt status: ${dossier.taxHistory.receiptStatus.value}.`
      : "Tax receipt status is not yet captured.",
    dossier.deedHistory.mortgageSignal.value
      ? `Mortgage signal: ${dossier.deedHistory.mortgageSignal.value}.`
      : "Mortgage balance/details require operator confirmation.",
    dossier.probateDocket.caseStatus.value
      ? `Probate case status: ${dossier.probateDocket.caseStatus.value}.`
      : "Probate case status is still open for research.",
    "Family tree and heirship notes are hypotheses only and do not constitute legal heir determinations.",
  ];
  return parts.join("\n\n");
}

function buildSummaries(dossier: RawDossier) {
  return {
    propertySummary: [
      `Address: ${claimText(dossier.property.address.value)}`,
      `Owner: ${claimText(dossier.property.ownerName.value)}`,
      `Estate: ${claimText(dossier.property.estateName.value)}`,
      `Case number: ${claimText(dossier.property.caseNumber.value)}`,
      `County: ${claimText(dossier.property.county.value, "miami-dade")}`,
      `Folio: ${claimText(dossier.property.parcelId.value)}`,
    ].join("\n"),
    taxSummary: [
      `Status: ${claimText(dossier.taxHistory.sourceStatus.value)}`,
      `Unpaid years: ${dossier.taxHistory.unpaidYears.value?.join(", ") ?? "Needs review"}`,
      `Amount due: ${dossier.taxHistory.amountDue.value ? formatMoney({ ...dossier.taxHistory.amountDue, label: "Taxes due", currency: "USD" } as OfferProfitField) : "Needs review"}`,
      `Reassessment: ${claimText(dossier.taxHistory.reassessment.value)}`,
      `Receipt status: ${claimText(dossier.taxHistory.receiptStatus.value)}`,
      `Payer identity: ${claimText(dossier.taxHistory.payerIdentity.value)}`,
    ].join("\n"),
    deedSummary: [
      `Status: ${claimText(dossier.deedHistory.sourceStatus.value)}`,
      `Latest deed: ${claimText(dossier.deedHistory.latestDeed.value)}`,
      `OR book/page: ${claimText(dossier.deedHistory.orBookPage.value)}`,
      `Last sale: ${claimText(dossier.deedHistory.lastSaleDate.value)}`,
      `Mortgage: ${claimText(dossier.deedHistory.mortgageSignal.value)}`,
      `Liens: ${claimText(dossier.deedHistory.lienSignal.value)}`,
      `Lis pendens: ${claimText(dossier.deedHistory.lisPendensSignal.value)}`,
      `Foreclosure: ${claimText(dossier.deedHistory.foreclosureSignal.value)}`,
    ].join("\n"),
    probateSummary: [
      `Status: ${claimText(dossier.probateDocket.sourceStatus.value)}`,
      `Case number: ${claimText(dossier.probateDocket.caseNumber.value)}`,
      `Case status: ${claimText(dossier.probateDocket.caseStatus.value)}`,
      `Affidavit of heirs: ${claimText(dossier.probateDocket.affidavitOfHeirs.value)}`,
      `Document availability: ${claimText(dossier.probateDocket.documentAvailability.value)}`,
    ].join("\n"),
    familyTreeSummary: [
      `Status: ${claimText(dossier.familyTree.sourceStatus.value)}`,
      `Nodes: ${dossier.familyTree.hypothesis.value?.nodes.length ?? 0}`,
      ...(dossier.familyTree.hypothesis.value?.unresolvedQuestions.map((question) => `- Open question: ${question}`) ?? []),
    ].join("\n"),
  };
}

function renderOfferTable(offerMath: CompletedLeadReport["offerMath"]): string[] {
  const rows: Array<[string, string]> = [
    ["As-is value", formatMoney(offerMath.asIsValue)],
    ["Taxes due", formatMoney(offerMath.taxesDue)],
    ["Liens", formatMoney(offerMath.liens)],
    ["Mortgages", formatMoney(offerMath.mortgages)],
    ["Selling costs", formatMoney(offerMath.sellingCosts)],
    ["Probate costs", formatMoney(offerMath.probateCosts)],
    ["Partition costs", formatMoney(offerMath.partitionCosts)],
    ["Post-equity value", formatMoney(offerMath.postEquityValue)],
    ["Number of heirs", offerMath.heirCount.value === null ? "Needs review" : String(offerMath.heirCount.value)],
    ["Equity per heir", formatMoney(offerMath.equityPerHeir)],
    ["Buy percentage", formatPercent(offerMath.buyPercentage)],
    ["Offer amount", formatMoney(offerMath.offerAmount)],
    ["Estimated profit", formatMoney(offerMath.profit)],
    ["Minimum net profit", formatMoney(offerMath.minimumNetProfit)],
  ];
  return [
    "| Field | Value |",
    "| --- | --- |",
    ...rows.map(([label, value]) => `| ${label} | ${value} |`),
  ];
}

function renderOutreachSection(dossier: RawDossier): string[] {
  const outreach = dossier.outreach;
  return [
    "## Outreach Drafts And Follow-Up",
    `Outreach status: ${humanStatus(outreach.readiness.status)}`,
    `Compliance review: ${humanStatus(outreach.complianceStatus)}`,
    `No-auto-send guard: ${outreach.noAutoSendGuard.enabled ? "Enabled" : "Missing"}`,
    "",
    "Draft assets:",
    ...outreach.assets.map((asset) => `- ${asset.title} (${asset.status}, ${asset.language}) — ${asset.intendedUse}`),
    "",
    "Readiness blockers:",
    ...(outreach.readiness.blockers.length
      ? outreach.readiness.blockers.map((blocker) => `- ${blocker}`)
      : ["- No outreach blockers recorded."]),
    "",
    "Manual follow-up tasks:",
    ...outreach.followUpTasks.map((task) => `- ${task.title} — ${task.description}`),
    "",
    "_These scripts are draft reference material only. Calls, texts, emails, letters, and offers remain manual and blocked until compliance/operator approval._",
  ];
}

export async function generateCompletedLeadReport(dossier: RawDossier): Promise<CompletedLeadReport> {
  const offerMath = buildOfferProfitMath(dossier);
  const leadQualityProfile = buildLeadQualityProfile(dossier);
  const reviewGate = buildReviewGate(dossier, offerMath.reviewFlags);
  const researchChecklist = buildResearchChecklist(dossier);
  const contactPlaceholders = buildContactPlaceholders(dossier);
  const sourceLinks = buildSourceLinks(dossier);
  const missingData = buildMissingData(dossier, offerMath);
  const summaries = buildSummaries(dossier);
  const backstory = buildBackstory(dossier);

  const lines = [
    `# Completed Lead Report - ${dossier.summary.displayName}`,
    "",
    "> **INTERNAL DRAFT** — Human review required. External outreach, offers, and compliance claims are blocked.",
    "",
    `Date added: ${new Date(dossier.generatedAt).toLocaleDateString("en-US")}`,
    `Report status: ${humanStatus(reviewGate.reportStatus)}`,
    `Underwriting status: ${humanStatus(reviewGate.underwritingStatus)}`,
    `Outreach readiness: ${humanStatus(reviewGate.outreachReadiness)}`,
    `External use blocked: ${reviewGate.externalUseBlocked ? "yes" : "no"}`,
    "",
    "## Client Report Snapshot",
    `Property: ${claimText(dossier.property.address.value)}`,
    `Owner / estate: ${claimText(dossier.summary.estateName ?? dossier.property.ownerName.value)}`,
    `County: ${claimText(dossier.property.county.value)}`,
    `Folio: ${claimText(dossier.property.parcelId.value)}`,
    `Possible heirs / contacts: ${contactPlaceholders.length}`,
    `Offer status: ${offerMath.offerAmount.note ?? formatMoney(offerMath.offerAmount)}`,
    `Open sections: ${missingData.join(", ") || "No open sections beyond review."}`,
    "",
    "## Backstory",
    backstory,
    "",
    "## Research Step Checklist",
    ...researchChecklist.map((step) => `- [${step.status === "complete" ? "x" : " "}] ${step.label} (${step.status}) — ${step.note}`),
    "",
    "## Property Summary",
    summaries.propertySummary,
    "",
    "## Tax Summary",
    summaries.taxSummary,
    "",
    "## Deed / Title Summary",
    summaries.deedSummary,
    "",
    "## Probate Summary",
    summaries.probateSummary,
    "",
    "## Family Tree Hypothesis",
    summaries.familyTreeSummary,
    "",
    "## Contact Placeholders",
    ...contactPlaceholders.map((contact) => `- ${contact.role}${contact.name ? `: ${contact.name}` : ""} — ${contact.note}`),
    "",
    ...renderOutreachSection(dossier),
    "",
    "## Lead Quality Profile",
    `Lead bucket: ${humanStatus(leadQualityProfile.leadBucket)}`,
    `Promotion eligible: ${leadQualityProfile.promotionEligible ? "yes" : "no"}`,
    `Enabled signals: ${leadQualityProfile.enabledSignals.join(", ") || "None"}`,
    `Missing signals: ${leadQualityProfile.missingSignals.join(", ") || "None recorded"}`,
    `Reason codes: ${leadQualityProfile.reasonCodes.join(", ") || "None"}`,
    "",
    "## Offer / Profit Math",
    ...renderOfferTable(offerMath),
    "",
    "_Offer math is draft-only. Unknown values remain placeholders until operator review._",
    "",
    "## Missing Data",
    ...(missingData.length ? missingData.map((item) => `- ${item}`) : ["- No critical missing-data items flagged beyond review placeholders."]),
    "",
    "## Source Links",
    ...(sourceLinks.length
      ? sourceLinks.map((link) => `- [${link.label}](${link.url}) (${link.source})`)
      : ["- No source URLs captured in this run."]),
    "",
    "## Review Flags",
    ...uniqueFlags([
      ...reviewGate.reviewFlags,
      ...leadQualityProfile.reviewFlags,
      ...offerMath.reviewFlags,
    ]).map((flag) => `- ${flag}`),
    "",
    "## Next Action",
    dossier.summary.nextBestAction,
  ];

  const markdown = lines.join("\n");
  const renderedMarkdown = await renderMarkdownWithStreamdown(markdown);
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(dossier.summary.displayName)} Completed Lead Report</title>
<style>
  :root {
    color-scheme: light;
    --doc-bg: #fffaf0;
    --doc-ink: #1d1710;
    --doc-muted: #615746;
    --doc-line: #d7bf7b;
    --doc-accent: #8a6116;
    --doc-banner: #fff1cc;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--doc-bg);
    color: var(--doc-ink);
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    line-height: 1.55;
  }
  .banner {
    background: var(--doc-banner);
    border-bottom: 2px solid var(--doc-line);
    color: var(--doc-accent);
    font-weight: 800;
    padding: 12px 28px;
    text-transform: uppercase;
    letter-spacing: .04em;
  }
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 28px;
  }
  .streamdown-doc { overflow-wrap: anywhere; }
  .streamdown-doc :where(h1, h2, h3) {
    color: var(--doc-ink);
    line-height: 1.15;
    margin: 1.35em 0 .5em;
  }
  .streamdown-doc h1 {
    margin-top: 0;
    font-family: Georgia, serif;
    font-size: clamp(28px, 6vw, 42px);
  }
  .streamdown-doc h2 {
    border-top: 1px solid var(--doc-line);
    color: var(--doc-accent);
    font-size: 18px;
    padding-top: 18px;
  }
  .streamdown-doc :where(p, ul, ol, pre, table, blockquote) { margin: 0 0 12px; }
  .streamdown-doc :where(ul, ol) { padding-left: 22px; }
  .streamdown-doc li { margin-bottom: 6px; }
  .streamdown-doc table { width: 100%; border-collapse: collapse; }
  .streamdown-doc th, .streamdown-doc td {
    border: 1px solid var(--doc-line);
    padding: 8px 10px;
    text-align: left;
    vertical-align: top;
  }
  .streamdown-doc blockquote {
    border-left: 3px solid var(--doc-line);
    color: var(--doc-muted);
    padding-left: 12px;
  }
  .streamdown-doc a { color: var(--doc-accent); }
</style>
</head>
<body>
<div class="banner">Internal draft — review required before outreach or offers</div>
<main>
${renderedMarkdown}
</main>
</body>
</html>`;

  return {
    id: `report-${slug(dossier.summary.displayName)}-${Date.now()}`,
    dossierId: dossier.id,
    generatedAt: nowIso(),
    reviewGate,
    backstory,
    researchChecklist,
    propertySummary: summaries.propertySummary,
    taxSummary: summaries.taxSummary,
    deedSummary: summaries.deedSummary,
    probateSummary: summaries.probateSummary,
    familyTreeSummary: summaries.familyTreeSummary,
    contactPlaceholders,
    missingData,
    sourceLinks,
    reviewFlags: uniqueFlags([
      ...reviewGate.reviewFlags,
      ...leadQualityProfile.reviewFlags,
      ...offerMath.reviewFlags,
      ...dossier.outreach.readiness.reviewFlags,
      ...dossier.outreach.noAutoSendGuard.reviewFlags,
      "REPORT_REVIEW_REQUIRED",
      "OUTREACH_BLOCKED",
    ]),
    leadQualityProfile,
    offerMath,
    formats: { markdown, html },
  };
}
