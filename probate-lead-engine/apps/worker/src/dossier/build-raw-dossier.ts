import type { DossierClaim, DossierEvent, LatestDeedRecord, OrBookPageRef, RawDossier, ReviewFlag, SourceEvidenceReviewTask, SourceFact, SourceKey, SourceRef, TaxAmountDue } from "@ple/types";
import { nowIso, sourceRef, slug } from "../lib";
import { runSourceEvidenceQa } from "../qa/source-evidence";
import { buildOperatorQueue } from "../queue/operator-queue";
import { evaluateWorkflowRules } from "../workflow/evaluate-workflow-rules";

function refsFor(facts: SourceFact[], factType: SourceFact["factType"]): SourceRef[] {
  return facts
    .filter((item) => item.factType === factType)
    .map((item) => sourceRef(item.source, item.rawId, item.fetchedAt));
}

function valueFor<T>(facts: SourceFact[], factType: SourceFact["factType"]): T | null {
  const item = facts.find((candidate) => candidate.factType === factType && candidate.value !== null && candidate.value !== undefined);
  return item ? (item.value as T) : null;
}

function claim<T>(facts: SourceFact[], factType: SourceFact["factType"], missing: ReviewFlag): DossierClaim<T> {
  const value = valueFor<T>(facts, factType);
  const related = facts.filter((item) => item.factType === factType);
  const reviewFlags = Array.from(new Set(related.flatMap((item) => item.reviewFlags).concat(value === null ? [missing] : [])));
  return {
    value,
    confidence: related.length ? Math.max(...related.map((item) => item.confidence)) : 0,
    sourceRefs: refsFor(facts, factType),
    reviewFlags,
  };
}

function reviewTask(input: {
  code: string;
  title: string;
  source: SourceKey;
  reason: string;
  nextAction: string;
  claim: DossierClaim<unknown>;
  fallbackFlags?: ReviewFlag[];
}): SourceEvidenceReviewTask | null {
  if (input.claim.value !== null && input.claim.reviewFlags.length === 0) return null;
  const reviewFlags = Array.from(new Set(input.claim.reviewFlags.concat(input.fallbackFlags ?? [])));
  return {
    code: input.code,
    title: input.title,
    source: input.source,
    reason: input.reason,
    nextAction: input.nextAction,
    sourceRefs: input.claim.sourceRefs,
    reviewFlags,
  };
}

function compactTasks(tasks: Array<SourceEvidenceReviewTask | null>): SourceEvidenceReviewTask[] {
  return tasks.filter((task): task is SourceEvidenceReviewTask => task !== null);
}

function combineClaims(claims: Array<DossierClaim<unknown>>): DossierClaim<unknown> {
  const firstValue = claims.find((item) => item.value !== null)?.value ?? null;
  return {
    value: firstValue,
    confidence: claims.length ? Math.max(...claims.map((item) => item.confidence)) : 0,
    sourceRefs: Array.from(new Map(claims.flatMap((item) => item.sourceRefs).map((ref) => [`${ref.source}:${ref.rawId}:${ref.fetchedAt}`, ref])).values()),
    reviewFlags: Array.from(new Set(claims.flatMap((item) => item.reviewFlags))),
  };
}

export function buildRawDossier(runId: string, facts: SourceFact[]): RawDossier {
  const address = claim<string>(facts, "property_address", "MISSING_PROPERTY_FACT");
  const ownerName = claim<string>(facts, "property_owner", "MISSING_OWNER_FACT");
  const county = claim<string>(facts, "property_county", "MISSING_PROPERTY_FACT");
  const parcelId = claim<string>(facts, "property_folio", "MISSING_PROPERTY_FACT");
  const taxSourceStatus = claim<string>(facts, "tax_history_status", "MISSING_TAX_HISTORY_FACT");
  const unpaidYears = claim<number[]>(facts, "unpaid_tax_years", "MISSING_TAX_HISTORY_FACT");
  const amountDue = claim<TaxAmountDue>(facts, "tax_amount_due", "MISSING_TAX_FACT");
  const reassessment = claim<string>(facts, "tax_reassessment_signal", "REASSESSMENT_REVIEW_REQUIRED");
  const receiptStatus = claim<string>(facts, "tax_receipt_status", "MISSING_TAX_RECEIPT_FACT");
  const payerIdentity = claim<string>(facts, "tax_payer_identity", "MISSING_TAX_PAYER_FACT");
  const taxHistory = {
    sourceStatus: taxSourceStatus,
    unpaidYears,
    amountDue,
    reassessment,
    receiptStatus,
    payerIdentity,
    reviewTasks: compactTasks([
      reviewTask({
        code: "TAX_UNPAID_YEARS",
        title: "Confirm unpaid tax years",
        source: "tax_collector",
        reason: "The workflow needs 2+ years unpaid-tax evidence before this can count as a tax-friction signal.",
        nextAction: "Open Miami-Dade tax records and capture unpaid years or mark the signal absent.",
        claim: unpaidYears,
        fallbackFlags: ["SOURCE_EVIDENCE_REQUIRED", "HUMAN_REVIEW_REQUIRED"],
      }),
      reviewTask({
        code: "TAX_AMOUNT_DUE",
        title: "Capture tax amount due",
        source: "tax_collector",
        reason: "Offer math and lead-quality review need the unpaid-tax amount instead of a placeholder.",
        nextAction: "Record amount due, currency, and tax years from the source record.",
        claim: amountDue,
        fallbackFlags: ["SOURCE_EVIDENCE_REQUIRED", "HUMAN_REVIEW_REQUIRED"],
      }),
      reviewTask({
        code: "TAX_REASSESSMENT",
        title: "Review reassessment signal",
        source: "tax_collector",
        reason: "Reassessment changes can affect equity and urgency, but extraction is not validated yet.",
        nextAction: "Check the public tax record for reassessment changes and preserve the source reference.",
        claim: reassessment,
        fallbackFlags: ["REASSESSMENT_REVIEW_REQUIRED", "HUMAN_REVIEW_REQUIRED"],
      }),
      reviewTask({
        code: "TAX_RECEIPT_STATUS",
        title: "Download or record tax receipt status",
        source: "tax_collector",
        reason: "Automated receipt download is not validated, so receipt capture must remain a manual operator step.",
        nextAction: "Download the receipt manually or mark it unavailable with a visible reason.",
        claim: receiptStatus,
        fallbackFlags: ["MANUAL_TAX_RECEIPT_DOWNLOAD_REQUIRED", "HUMAN_REVIEW_REQUIRED"],
      }),
      reviewTask({
        code: "TAX_PAYER_IDENTITY",
        title: "Confirm tax payer identity",
        source: "tax_collector",
        reason: "The workflow uses payer identity to spot heir/operator activity and possible third-party friction.",
        nextAction: "Record who paid taxes from the public record or keep the field review-required.",
        claim: payerIdentity,
        fallbackFlags: ["SOURCE_EVIDENCE_REQUIRED", "HUMAN_REVIEW_REQUIRED"],
      }),
    ]),
    manualReceiptTask: {
      required: true,
      reason: "Automated tax receipt download is not validated yet; keep receipt capture as an operator task.",
      sourceRefs: refsFor(facts, "tax_receipt_status"),
      reviewFlags: ["MANUAL_TAX_RECEIPT_DOWNLOAD_REQUIRED", "HUMAN_REVIEW_REQUIRED"] as ReviewFlag[],
    },
  };
  const deedSourceStatus = claim<string>(facts, "deed_history_status", "MISSING_DEED_FACT");
  const latestDeed = claim<LatestDeedRecord>(facts, "latest_deed", "MISSING_DEED_FACT");
  const orBookPage = claim<OrBookPageRef>(facts, "or_book_page", "MISSING_OR_BOOK_PAGE_FACT");
  const lastSaleDate = claim<string>(facts, "last_sale_date", "MISSING_RECENT_SALE_FACT");
  const mailingAddressSignal = claim<string>(facts, "mailing_address_signal", "MISSING_MAILING_ADDRESS_FACT");
  const ownershipActivity = claim<string>(facts, "ownership_activity_note", "MISSING_DEED_FACT");
  const mortgageSignal = claim<string>(facts, "mortgage_signal", "MISSING_TITLE_FACT");
  const lienSignal = claim<string>(facts, "lien_signal", "MISSING_TITLE_FACT");
  const lisPendensSignal = claim<string>(facts, "lis_pendens_signal", "MISSING_TITLE_FACT");
  const foreclosureSignal = claim<string>(facts, "foreclosure_signal", "MISSING_TITLE_FACT");
  const adversePossessionSignal = claim<boolean>(facts, "adverse_possession_signal", "MISSING_ADVERSE_POSSESSION_FACT");
  const deedHistory = {
    sourceStatus: deedSourceStatus,
    latestDeed,
    orBookPage,
    lastSaleDate,
    mailingAddressSignal,
    ownershipActivity,
    mortgageSignal,
    lienSignal,
    lisPendensSignal,
    foreclosureSignal,
    adversePossessionSignal,
    reviewTasks: compactTasks([
      reviewTask({
        code: "DEED_LATEST",
        title: "Capture latest recorded deed",
        source: "official_records",
        reason: "The latest deed anchors ownership activity and the recent-sale guard.",
        nextAction: "Record document type, recording date, grantor/grantee, and source link.",
        claim: latestDeed,
        fallbackFlags: ["MISSING_DEED_FACT", "SOURCE_EVIDENCE_REQUIRED", "HUMAN_REVIEW_REQUIRED"],
      }),
      reviewTask({
        code: "DEED_OR_BOOK_PAGE",
        title: "Capture OR book/page or instrument number",
        source: "official_records",
        reason: "HeirRight needs OR book/page evidence to tie title claims to public records.",
        nextAction: "Record OR book/page or instrument number from Official Records.",
        claim: orBookPage,
        fallbackFlags: ["MISSING_OR_BOOK_PAGE_FACT", "SOURCE_EVIDENCE_REQUIRED", "HUMAN_REVIEW_REQUIRED"],
      }),
      reviewTask({
        code: "DEED_LAST_SALE",
        title: "Confirm last sale date",
        source: "official_records",
        reason: "A sale inside 5 years is a stop condition unless a human operator overrides it.",
        nextAction: "Capture the last sale date or mark it unknown with the source checked.",
        claim: lastSaleDate,
        fallbackFlags: ["MISSING_RECENT_SALE_FACT", "SOURCE_EVIDENCE_REQUIRED", "HUMAN_REVIEW_REQUIRED"],
      }),
      reviewTask({
        code: "MAILING_ADDRESS_CHECK",
        title: "Check mailing addresses",
        source: "property_appraiser",
        reason: "The workflow asks operators to check mailing addresses associated with the property before promotion.",
        nextAction: "Capture mailing address matches, mismatches, or missing source evidence from the county property record.",
        claim: mailingAddressSignal,
        fallbackFlags: ["MISSING_MAILING_ADDRESS_FACT", "SOURCE_EVIDENCE_REQUIRED", "HUMAN_REVIEW_REQUIRED"],
      }),
      reviewTask({
        code: "DEED_OWNERSHIP_ACTIVITY",
        title: "Review ownership activity",
        source: "official_records",
        reason: "Ownership changes, mailing-address changes, and recorded activity influence lead qualification.",
        nextAction: "Summarize relevant ownership activity and preserve source references.",
        claim: ownershipActivity,
        fallbackFlags: ["MISSING_DEED_FACT", "SOURCE_EVIDENCE_REQUIRED", "HUMAN_REVIEW_REQUIRED"],
      }),
      reviewTask({
        code: "TITLE_FRICTION",
        title: "Check mortgage, lien, Lis Pendens, and foreclosure signals",
        source: "official_records",
        reason: "Title-friction signals affect both lead quality and offer math.",
        nextAction: "Record each signal as present, absent, or still blocked by extraction limits.",
        claim: combineClaims([mortgageSignal, lienSignal, lisPendensSignal, foreclosureSignal]),
        fallbackFlags: ["MISSING_TITLE_FACT", "SOURCE_EVIDENCE_REQUIRED", "HUMAN_REVIEW_REQUIRED"],
      }),
      reviewTask({
        code: "ADVERSE_POSSESSION",
        title: "Check adverse-possession signal",
        source: "official_records",
        reason: "Adverse possession requires human review before downstream action.",
        nextAction: "Confirm whether any adverse-possession signal appears in Official Records.",
        claim: adversePossessionSignal,
        fallbackFlags: ["MISSING_ADVERSE_POSSESSION_FACT", "SOURCE_EVIDENCE_REQUIRED", "HUMAN_REVIEW_REQUIRED"],
      }),
    ]),
  };
  const workflow = evaluateWorkflowRules(facts);
  const auditFlags = Array.from(new Set(
    facts
      .flatMap((item) => item.reviewFlags)
      .concat(workflow.reviewFlags)
      .concat(["NO_ENRICHMENT_RUN"] as ReviewFlag[]),
  ));
  const titleFacts = facts.filter((item) => item.factType === "title_signal" || item.factType === "official_records_status");
  const titleEvents: DossierEvent[] = titleFacts.map((item, index) => ({
    id: `${runId}:title:${index + 1}`,
    label: item.factType === "official_records_status" ? "Official Records source checked" : "Title signal pending extraction",
    source: item.source,
    sourceRef: sourceRef(item.source, item.rawId, item.fetchedAt),
    risk: item.reviewFlags.includes("SOURCE_BLOCKED") ? "high" : "unknown",
    explanation: typeof item.value === "object" && item.value !== null && "note" in item.value
      ? String((item.value as { note?: unknown }).note)
      : "Official-record title details require browser/API extraction before claims can be treated as verified.",
    reviewFlags: item.reviewFlags,
  }));

  const displayName = ownerName.value
    ? `${ownerName.value} - ${address.value ?? "Property Review"}`
    : address.value ?? "HeirRight Public-Source Lead";

  const narrative = [
    `Raw no-enrichment dossier generated for ${displayName}.`,
    address.value ? `Property seed: ${address.value}.` : "Property address is missing and must be reviewed.",
    ownerName.value ? `Owner seed: ${ownerName.value}.` : "Owner name was not confirmed by the current run.",
    "Miami-Dade public source availability was checked before any CRM or outreach action.",
    "This is not a skip-traced or scored dossier. It is a raw public-source shell for human review.",
  ].join(" ");

  const dossierWithoutQueue: Omit<RawDossier, "operatorQueue" | "evidenceQa"> = {
    id: `dossier-${slug(displayName)}-${runId}`,
    runId,
    status: auditFlags.includes("SOURCE_BLOCKED") ? "blocked" : "ready_for_review",
    generatedAt: nowIso(),
    summary: {
      displayName,
      priority: "review",
      nextBestAction: workflow.nextAction,
    },
    property: {
      address,
      ownerName,
      county,
      parcelId,
    },
    taxHistory,
    deedHistory,
    titleEvents,
    workflow,
    narrative,
    crm: {
      provider: "podio",
      mode: "dry_run",
      status: "not_configured",
      reviewFlags: ["MISSING_CRM_CREDENTIALS", "HUMAN_REVIEW_REQUIRED"],
    },
    audit: {
      sourceRefs: facts.map((item) => sourceRef(item.source, item.rawId, item.fetchedAt)),
      reviewFlags: auditFlags,
      facts,
    },
  };
  const operatorQueue = buildOperatorQueue(dossierWithoutQueue);
  const dossierWithQueue = { ...dossierWithoutQueue, operatorQueue };
  const evidenceQa = runSourceEvidenceQa(dossierWithQueue);

  return { ...dossierWithQueue, evidenceQa };
}
