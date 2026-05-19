import type { IntakeSeed, SourceFact } from "@ple/types";
import { fact, fetchStatus, nowIso, slug } from "../lib";

const PROPERTY_SEARCH_URL = "https://www.miamidade.gov/Apps/PA/PropertySearch/#/";

export async function fetchPropertyFacts(runId: string, seed: IntakeSeed): Promise<SourceFact[]> {
  const fetchedAt = nowIso();
  const status = await fetchStatus(PROPERTY_SEARCH_URL);
  const rawId = `property-search:${slug(seed.propertyAddress)}`;
  const subject = {
    ownerName: seed.ownerName,
    propertyAddress: seed.propertyAddress,
    parcelId: seed.parcelId,
    county: seed.county,
  };

  return [
    fact({
      runId,
      source: "property_appraiser",
      rawId: `${rawId}:status`,
      fetchedAt,
      county: seed.county,
      subject,
      factType: "source_status",
      value: {
        ok: status.ok,
        status: status.status,
        finalUrl: status.finalUrl,
        note: status.ok
          ? "Miami-Dade Property Search public app is reachable. Server-side result extraction still requires endpoint inspection or browser automation."
          : status.error ?? "Miami-Dade Property Search was not reachable.",
      },
      confidence: status.ok ? 0.8 : 0.2,
      sourceUrl: status.finalUrl,
      reviewFlags: status.ok ? ["SOURCE_HEALTH_ONLY", "NO_ENRICHMENT_RUN"] : ["SOURCE_BLOCKED", "NO_ENRICHMENT_RUN"],
    }),
    fact({
      runId,
      source: "property_appraiser",
      rawId: `${rawId}:search-url`,
      fetchedAt,
      county: seed.county,
      subject,
      factType: "source_search_url",
      value: PROPERTY_SEARCH_URL,
      confidence: 0.9,
      sourceUrl: PROPERTY_SEARCH_URL,
      reviewFlags: ["SOURCE_HEALTH_ONLY", "NO_ENRICHMENT_RUN"],
    }),
    fact({
      runId,
      source: "property_appraiser",
      rawId: `${rawId}:address`,
      fetchedAt,
      county: seed.county,
      subject,
      factType: "property_address",
      value: seed.propertyAddress,
      confidence: 0.7,
      sourceUrl: PROPERTY_SEARCH_URL,
      reviewFlags: ["HUMAN_REVIEW_REQUIRED", "NO_ENRICHMENT_RUN"],
    }),
    fact({
      runId,
      source: "property_appraiser",
      rawId: `${rawId}:owner`,
      fetchedAt,
      county: seed.county,
      subject,
      factType: "property_owner",
      value: seed.ownerName ?? null,
      confidence: seed.ownerName ? 0.65 : 0,
      sourceUrl: PROPERTY_SEARCH_URL,
      reviewFlags: seed.ownerName ? ["HUMAN_REVIEW_REQUIRED", "NO_ENRICHMENT_RUN"] : ["MISSING_OWNER_FACT", "HUMAN_REVIEW_REQUIRED", "NO_ENRICHMENT_RUN"],
    }),
    fact({
      runId,
      source: "property_appraiser",
      rawId: `${rawId}:folio`,
      fetchedAt,
      county: seed.county,
      subject,
      factType: "property_folio",
      value: seed.parcelId ?? null,
      confidence: seed.parcelId ? 0.65 : 0,
      sourceUrl: PROPERTY_SEARCH_URL,
      reviewFlags: seed.parcelId ? ["HUMAN_REVIEW_REQUIRED", "NO_ENRICHMENT_RUN"] : ["MISSING_PROPERTY_FACT", "HUMAN_REVIEW_REQUIRED", "NO_ENRICHMENT_RUN"],
    }),
  ];
}
