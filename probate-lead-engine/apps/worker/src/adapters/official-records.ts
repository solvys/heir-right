import type { IntakeSeed, SourceFact } from "@ple/types";
import { fact, fetchStatus, nowIso, slug } from "../lib";

const OFFICIAL_RECORDS_URL = "https://onlineservices.miamidadeclerk.gov/officialrecords";

export async function fetchOfficialRecordFacts(runId: string, seed: IntakeSeed): Promise<SourceFact[]> {
  const fetchedAt = nowIso();
  const status = await fetchStatus(OFFICIAL_RECORDS_URL);
  const rawId = `official-records:${slug(seed.ownerName || seed.propertyAddress)}`;
  const subject = {
    ownerName: seed.ownerName,
    propertyAddress: seed.propertyAddress,
    parcelId: seed.parcelId,
    county: seed.county,
  };

  return [
    fact({
      runId,
      source: "official_records",
      rawId: `${rawId}:status`,
      fetchedAt,
      county: seed.county,
      subject,
      factType: "official_records_status",
      value: {
        ok: status.ok,
        status: status.status,
        finalUrl: status.finalUrl,
        note: status.ok
          ? "Official Records public app is reachable. Result extraction needs endpoint discovery or browser automation because the app is client-rendered."
          : status.error ?? "Official Records was not reachable.",
      },
      confidence: status.ok ? 0.75 : 0.2,
      sourceUrl: status.finalUrl,
      reviewFlags: status.ok ? ["SOURCE_HEALTH_ONLY", "NO_ENRICHMENT_RUN"] : ["SOURCE_BLOCKED", "NO_ENRICHMENT_RUN"],
    }),
    fact({
      runId,
      source: "official_records",
      rawId: `${rawId}:title-signal`,
      fetchedAt,
      county: seed.county,
      subject,
      factType: "title_signal",
      value: {
        signal: "official_records_search_required",
        ownerName: seed.ownerName ?? null,
        propertyAddress: seed.propertyAddress,
      },
      confidence: 0.35,
      sourceUrl: OFFICIAL_RECORDS_URL,
      reviewFlags: ["MISSING_TITLE_FACT", "HUMAN_REVIEW_REQUIRED", "NO_ENRICHMENT_RUN"],
    }),
  ];
}
