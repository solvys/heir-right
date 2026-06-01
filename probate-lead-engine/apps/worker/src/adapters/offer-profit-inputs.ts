import type { IntakeSeed, SourceFact } from "@ple/types";
import { fact, intakeSubject, nowIso, seedIdentity, slug } from "../lib";

export async function fetchOfferProfitInputFacts(runId: string, seed: IntakeSeed): Promise<SourceFact[]> {
  const fetchedAt = nowIso();
  const identity = slug(seedIdentity(seed));
  const rawId = `offer-profit:${identity}`;
  const subject = intakeSubject(seed);
  const missingFlags = ["MISSING_OFFER_MATH_FACT", "UNDERWRITING_REVIEW_REQUIRED", "HUMAN_REVIEW_REQUIRED", "NO_ENRICHMENT_RUN"] as const;

  return [
    fact({
      runId,
      source: "intake",
      rawId: `${rawId}:as-is-value`,
      fetchedAt,
      county: seed.county,
      subject,
      factType: "offer_as_is_value",
      value: null,
      confidence: 0,
      reviewFlags: [...missingFlags],
    }),
    fact({
      runId,
      source: "intake",
      rawId: `${rawId}:heir-count`,
      fetchedAt,
      county: seed.county,
      subject,
      factType: "offer_heir_count",
      value: null,
      confidence: 0,
      reviewFlags: [...missingFlags],
    }),
    fact({
      runId,
      source: "intake",
      rawId: `${rawId}:buy-percentage`,
      fetchedAt,
      county: seed.county,
      subject,
      factType: "offer_buy_percentage",
      value: 50,
      confidence: 0.5,
      reviewFlags: ["UNDERWRITING_REVIEW_REQUIRED", "HUMAN_REVIEW_REQUIRED", "NO_ENRICHMENT_RUN"],
    }),
    fact({
      runId,
      source: "intake",
      rawId: `${rawId}:minimum-net-profit`,
      fetchedAt,
      county: seed.county,
      subject,
      factType: "offer_minimum_net_profit",
      value: 15000,
      confidence: 0.5,
      reviewFlags: ["UNDERWRITING_REVIEW_REQUIRED", "HUMAN_REVIEW_REQUIRED", "NO_ENRICHMENT_RUN"],
    }),
  ];
}
