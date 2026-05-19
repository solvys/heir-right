import type { DossierClaim, DossierEvent, RawDossier, ReviewFlag, SourceFact, SourceRef } from "@ple/types";
import { nowIso, sourceRef, slug } from "../lib";

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

export function buildRawDossier(runId: string, facts: SourceFact[]): RawDossier {
  const address = claim<string>(facts, "property_address", "MISSING_PROPERTY_FACT");
  const ownerName = claim<string>(facts, "property_owner", "MISSING_OWNER_FACT");
  const county = claim<string>(facts, "property_county", "MISSING_PROPERTY_FACT");
  const parcelId = claim<string>(facts, "property_folio", "MISSING_PROPERTY_FACT");
  const auditFlags = Array.from(new Set(facts.flatMap((item) => item.reviewFlags).concat(["NO_ENRICHMENT_RUN"] as ReviewFlag[])));
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

  return {
    id: `dossier-${slug(displayName)}-${runId}`,
    runId,
    status: auditFlags.includes("SOURCE_BLOCKED") ? "blocked" : "ready_for_review",
    generatedAt: nowIso(),
    summary: {
      displayName,
      priority: "review",
      nextBestAction: "Review public-source findings, confirm property/title facts, then decide whether to run enrichment.",
    },
    property: {
      address,
      ownerName,
      county,
      parcelId,
    },
    titleEvents,
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
}
