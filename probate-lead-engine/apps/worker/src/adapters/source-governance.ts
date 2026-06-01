import type { IntakeSeed, SourceFact, SourceGovernanceCatalog } from "@ple/types";
import { fact, intakeSubject, nowIso, seedIdentity, slug } from "../lib";

function buildGovernanceCatalog(): SourceGovernanceCatalog {
  const paidFlags = ["PAID_SOURCE_APPROVAL_REQUIRED", "STORAGE_APPROVAL_REQUIRED", "HUMAN_REVIEW_REQUIRED", "NO_ENRICHMENT_RUN"] as const;
  const manualFlags = ["MANUAL_SOURCE_APPROVAL_REQUIRED", "HUMAN_REVIEW_REQUIRED", "NO_ENRICHMENT_RUN"] as const;

  return {
    taxonomy: ["public_automated", "manual_approved", "paid_approval_gated", "blocked"],
    governedSources: [
      { code: "idi", label: "IDI", accessClass: "paid_approval_gated", automationAllowed: false, storageApproved: false, reason: "Paid skip-trace source requires client approval before use or storage.", reviewFlags: [...paidFlags] },
      { code: "intelius", label: "Intelius", accessClass: "paid_approval_gated", automationAllowed: false, storageApproved: false, reason: "Paid people-search source requires client approval before use or storage.", reviewFlags: [...paidFlags] },
      { code: "ancestry", label: "Ancestry", accessClass: "paid_approval_gated", automationAllowed: false, storageApproved: false, reason: "Paid genealogy source requires client approval before use or storage.", reviewFlags: [...paidFlags] },
      { code: "forewarn", label: "ForeWarn", accessClass: "paid_approval_gated", automationAllowed: false, storageApproved: false, reason: "Paid risk/source tool requires client approval before use or storage.", reviewFlags: [...paidFlags] },
      { code: "vitalchek", label: "VitalChek", accessClass: "paid_approval_gated", automationAllowed: false, storageApproved: false, reason: "Paid vital-record ordering requires client approval; no automated VitalChek flow.", reviewFlags: [...paidFlags] },
      { code: "private_investigator", label: "Private investigator request", accessClass: "manual_approved", automationAllowed: false, storageApproved: false, reason: "PI requests remain manual and approval-gated.", reviewFlags: [...manualFlags] },
    ],
    manualTasks: [
      { code: "DOOR_KNOCK", title: "Door knock / field visit", description: "Schedule only after explicit manual-work approval.", accessClass: "manual_approved", reviewFlags: [...manualFlags] },
      { code: "NEIGHBOR_RESEARCH", title: "Neighbor research", description: "Capture neighbor observations as audit notes, not automated facts.", accessClass: "manual_approved", reviewFlags: [...manualFlags] },
      { code: "CODE_ENFORCEMENT", title: "Code enforcement call", description: "Manual municipal/code-enforcement follow-up.", accessClass: "manual_approved", reviewFlags: [...manualFlags] },
      { code: "DOCUMENT_REQUEST", title: "Manual document request", description: "Request court or vital records manually when automation is blocked.", accessClass: "manual_approved", reviewFlags: [...manualFlags] },
    ],
    auditNotes: [
      "No paid or manual source is automated by default in S6.",
      "Storage of paid-source results requires explicit client approval.",
      "Manual observations must be recorded as audit notes with operator attribution.",
    ],
  };
}

export async function fetchSourceGovernanceFacts(runId: string, seed: IntakeSeed): Promise<SourceFact[]> {
  const fetchedAt = nowIso();
  const rawId = `source-governance:${slug(seedIdentity(seed))}`;
  const subject = intakeSubject(seed);

  return [
    fact({
      runId,
      source: "intake",
      rawId: `${rawId}:catalog`,
      fetchedAt,
      county: seed.county,
      subject,
      factType: "source_governance_catalog",
      value: buildGovernanceCatalog(),
      confidence: 1,
      reviewFlags: ["PAID_SOURCE_APPROVAL_REQUIRED", "MANUAL_SOURCE_APPROVAL_REQUIRED", "HUMAN_REVIEW_REQUIRED", "NO_ENRICHMENT_RUN"],
    }),
  ];
}
