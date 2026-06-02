import { existsSync } from "node:fs";
import type { SourceFact, SourceKey, SourceSubject } from "@ple/types";
import { buildRawDossier } from "../dossier/build-raw-dossier";
import { runDryPipeline } from "../index";
import { fact, nowIso } from "../lib";
import { persistOutput } from "../storage/write-output";

function fixtureFact(input: {
  runId: string;
  rawId: string;
  source?: SourceKey;
  factType: SourceFact["factType"];
  value: unknown;
  subject: SourceSubject;
  reviewFlags?: SourceFact["reviewFlags"];
}): SourceFact {
  return fact({
    runId: input.runId,
    source: input.source ?? "property_appraiser",
    rawId: input.rawId,
    fetchedAt: nowIso(),
    county: input.subject.county ?? "miami-dade",
    subject: input.subject,
    factType: input.factType,
    value: input.value,
    confidence: input.value === null ? 0 : 0.95,
    sourceUrl: "validation://s5-fixture",
    reviewFlags: input.reviewFlags ?? ["HUMAN_REVIEW_REQUIRED", "NO_ENRICHMENT_RUN"],
  });
}

function buildS5FixtureDossier(input: {
  runId: string;
  ownerName: string;
  ownerType: string;
  lastSaleDate?: string | null;
}) {
  const subject: SourceSubject = {
    ownerName: input.ownerName,
    propertyAddress: "20611 NW 33rd Pl, Miami Gardens, FL 33056",
    county: "miami-dade",
  };
  const facts = [
    fixtureFact({ runId: input.runId, rawId: `${input.runId}:address`, factType: "property_address", value: subject.propertyAddress, subject }),
    fixtureFact({ runId: input.runId, rawId: `${input.runId}:owner`, factType: "property_owner", value: input.ownerName, subject }),
    fixtureFact({ runId: input.runId, rawId: `${input.runId}:owner-type`, factType: "owner_type", value: input.ownerType, subject }),
    fixtureFact({ runId: input.runId, rawId: `${input.runId}:county`, factType: "property_county", value: "miami-dade", subject }),
    fixtureFact({
      runId: input.runId,
      rawId: `${input.runId}:last-sale-date`,
      source: "official_records",
      factType: "last_sale_date",
      value: input.lastSaleDate ?? null,
      subject,
      reviewFlags: input.lastSaleDate ? ["HUMAN_REVIEW_REQUIRED", "NO_ENRICHMENT_RUN"] : ["MISSING_RECENT_SALE_FACT", "SOURCE_EVIDENCE_REQUIRED", "HUMAN_REVIEW_REQUIRED"],
    }),
  ];
  return buildRawDossier(input.runId, facts);
}

async function main(): Promise<void> {
  const result = await runDryPipeline({
    propertyAddress: "20611 NW 33rd Pl, Miami Gardens, FL 33056",
    ownerName: "Fresh public-source validation lead",
    county: "miami-dade",
    source: "operator_cli",
  });
  for (const output of Object.values(result.outputFiles)) persistOutput(output);

  const failures: string[] = [];
  if (!result.facts.length) failures.push("No source facts generated.");
  if (!result.dossier.property.address.value) failures.push("Dossier address missing.");
  if (!result.dossier.audit.sourceRefs.length) failures.push("Dossier sourceRefs missing.");
  if (!result.dossier.crm.payload) failures.push("Podio dry-run payload missing.");
  if (!result.dossier.documentPacket?.formats.markdown) failures.push("Internal summary markdown missing.");
  if (!result.dossier.documentPacket?.formats.html.includes("streamdown-doc")) failures.push("Streamdown HTML output missing.");
  if (result.dossier.documentPacket?.renderer !== "streamdown") failures.push("Document packet renderer is not Streamdown.");
  if (!result.dossier.completedLeadReport?.formats.markdown.includes("Completed Lead Report")) failures.push("Completed lead report markdown missing.");
  if (!result.dossier.completedLeadReport?.formats.markdown.includes("Date added:")) failures.push("Completed lead report date-added line missing.");
  if (!result.dossier.completedLeadReport?.formats.markdown.includes("Client Report Snapshot")) failures.push("Completed lead report client snapshot missing.");
  if (!result.dossier.completedLeadReport?.formats.html.includes("Internal draft")) failures.push("Completed lead report review banner missing.");
  if (!result.dossier.completedLeadReport?.reviewGate.externalUseBlocked) failures.push("Completed lead report external-use gate missing.");
  if (!result.dossier.completedLeadReport?.offerMath.reviewFlags.includes("UNDERWRITING_REVIEW_REQUIRED")) failures.push("Offer math underwriting review flag missing.");
  if (!result.dossier.completedLeadReport?.researchChecklist.length) failures.push("Completed lead report research checklist missing.");
  if (!result.dossier.completedLeadReport?.leadQualityProfile.leadBucket) failures.push("Lead quality profile bucket missing.");
  if (!result.facts.some((item) => item.factType === "offer_buy_percentage")) failures.push("Offer buy percentage fact missing.");
  if (!result.facts.some((item) => item.factType === "offer_minimum_net_profit")) failures.push("Offer minimum net profit fact missing.");
  const podioOffer = (result.dossier.crm.payload as { appModel?: { fields?: { offer_math?: unknown; lead_bucket?: unknown; outreach_readiness?: unknown } } })?.appModel?.fields;
  if (!podioOffer?.offer_math) failures.push("Podio offer_math payload missing.");
  if (!podioOffer?.lead_bucket) failures.push("Podio lead_bucket payload missing.");
  if (!podioOffer?.outreach_readiness) failures.push("Podio outreach_readiness payload missing.");
  if (!result.dossier.outreach?.assets.length) failures.push("S8 outreach draft assets missing.");
  if (result.dossier.outreach.assets.length < 9) failures.push("S8 outreach script inventory incomplete.");
  if (result.dossier.outreach.assets.some((asset) => asset.status !== "draft" && asset.status !== "needs_compliance_review")) failures.push("S8 outreach asset escaped draft/review status.");
  if (result.dossier.outreach.assets.some((asset) => asset.automationAllowed || asset.externalUseAllowed)) failures.push("S8 outreach asset incorrectly allows automation or external use.");
  if (result.dossier.outreach.complianceStatus !== "needs_compliance_review") failures.push("S8 compliance status should require review.");
  if (!result.dossier.outreach.noAutoSendGuard.enabled) failures.push("S8 no-auto-send guard missing.");
  for (const blocked of ["call", "voicemail", "text", "email", "letter"] as const) {
    if (!result.dossier.outreach.noAutoSendGuard.blockedActions.includes(blocked)) failures.push(`S8 no-auto-send guard missing ${blocked}.`);
  }
  if (result.dossier.outreach.readiness.status !== "blocked") failures.push("S8 outreach readiness should be blocked before approvals.");
  if (!result.dossier.outreach.readiness.reviewFlags.includes("COMPLIANCE_REVIEW_REQUIRED")) failures.push("S8 compliance review flag missing.");
  if (!result.dossier.outreach.readiness.reviewFlags.includes("CONTACT_REVIEW_REQUIRED")) failures.push("S8 contact review flag missing.");
  const followUps = result.dossier.outreach.followUpTasks;
  if (followUps.filter((task) => task.channel === "call" && task.attemptNumber !== null).length < 3) failures.push("S8 three-call follow-up pattern missing.");
  if (!followUps.some((task) => task.id === "voicemail-text-follow-up")) failures.push("S8 voicemail/text follow-up task missing.");
  if (!followUps.some((task) => task.id === "multi-contact-review")) failures.push("S8 multi-contact review task missing.");
  if (!followUps.some((task) => task.id === "joshua-escalation" && task.assignedRole === "manager")) failures.push("S8 Joshua escalation task missing.");
  if (followUps.some((task) => !task.manualOnly)) failures.push("S8 follow-up task is not manual-only.");
  if (!result.dossier.completedLeadReport?.formats.markdown.includes("Outreach Drafts And Follow-Up")) failures.push("Completed lead report outreach section missing.");
  if (!result.dossier.completedLeadReport?.formats.markdown.includes("No-auto-send guard: Enabled")) failures.push("Completed lead report no-auto-send guard missing.");
  const podioPayload = result.dossier.crm.payload as {
    appModel?: { fields?: { outreach_workflow?: unknown } };
    podioReadiness?: { blockers?: string[]; csvDryRunRequirements?: string[]; readbackChecks?: string[]; classification?: string };
  };
  if (!podioPayload.appModel?.fields?.outreach_workflow) failures.push("Podio outreach_workflow payload missing.");
  if (!podioPayload.podioReadiness?.csvDryRunRequirements?.length) failures.push("S9 CSV dry-run prep missing.");
  if (!podioPayload.podioReadiness?.readbackChecks?.length) failures.push("S9 Podio readback checks missing.");
  if (!podioPayload.podioReadiness?.blockers?.some((item) => item.includes("Live sync is disabled"))) failures.push("S9 live-sync blocker missing.");
  if (!result.dossier.workflow.rules.length) failures.push("Workflow rules missing.");
  if (!result.dossier.workflow.leadQuality.enabledSignals.length) failures.push("Lead-quality settings missing.");
  if (!result.facts.some((item) => item.factType === "owner_type")) failures.push("Owner-type workflow fact missing.");
  if (!result.dossier.taxHistory.manualReceiptTask.required) failures.push("Manual tax receipt fallback missing.");
  if (result.dossier.taxHistory.reviewTasks.length < 5) failures.push("Tax history review tasks missing.");
  if (result.dossier.deedHistory.reviewTasks.length < 7) failures.push("Deed/title review tasks missing.");
  if (!result.dossier.probateDocket.reviewTasks.length) failures.push("Probate docket review tasks missing.");
  if (!result.dossier.probateDocket.documentRequestTask.required) failures.push("Probate document request task missing.");
  if (!result.facts.some((item) => item.factType === "probate_docket_status")) failures.push("Probate docket status fact missing.");
  const podioProbate = (result.dossier.crm.payload as { appModel?: { fields?: { probate_docket?: unknown } } })?.appModel?.fields?.probate_docket;
  if (!podioProbate) failures.push("Podio probate_docket payload missing.");
  if (!result.dossier.marriageDeathIndicators.reviewTasks.length) failures.push("Marriage/death review tasks missing.");
  if (!result.dossier.marriageDeathIndicators.deathCertificateTask.required) failures.push("Death certificate task missing.");
  if (!result.dossier.familyTree.hypothesis.value?.nodes.length) failures.push("Family tree hypothesis nodes missing.");
  if (!result.dossier.sourceGovernance.catalog.value?.governedSources.length) failures.push("Source governance catalog missing.");
  const paidSource = result.dossier.sourceGovernance.catalog.value?.governedSources.find((source) => source.code === "idi");
  if (paidSource?.automationAllowed) failures.push("Paid source IDI incorrectly marked as automated.");
  if (!result.facts.some((item) => item.factType === "marriage_death_status")) failures.push("Marriage/death status fact missing.");
  if (!result.facts.some((item) => item.factType === "family_tree_hypothesis")) failures.push("Family tree hypothesis fact missing.");
  if (!result.facts.some((item) => item.factType === "source_governance_catalog")) failures.push("Source governance catalog fact missing.");
  const podioHeirship = (result.dossier.crm.payload as { appModel?: { fields?: { marriage_death_indicators?: unknown; family_tree?: unknown; source_governance?: unknown } } })?.appModel?.fields;
  if (!podioHeirship?.marriage_death_indicators) failures.push("Podio marriage_death_indicators payload missing.");
  if (!podioHeirship?.family_tree) failures.push("Podio family_tree payload missing.");
  if (!podioHeirship?.source_governance) failures.push("Podio source_governance payload missing.");
  if (!result.dossier.deedHistory.mailingAddressSignal.reviewFlags.includes("MISSING_MAILING_ADDRESS_FACT")) failures.push("Mailing-address review flag missing.");
  if (!result.dossier.deedHistory.orBookPage.reviewFlags.length) failures.push("OR book/page review flags missing.");
  if (!result.dossier.operatorQueue.items.length) failures.push("Operator queue items missing.");
  if (!result.dossier.evidenceQa.checks.length) failures.push("Source evidence QA checks missing.");
  if (result.dossier.evidenceQa.status === "failed") failures.push("Source evidence QA failed.");

  const estateResult = await runDryPipeline({
    estateName: "Estate of Maria Lopez",
    county: "miami-dade",
    source: "operator_cli",
  });
  if (!estateResult.dossier.summary.estateName) failures.push("Estate-only seed missing summary.estateName.");
  if (!estateResult.dossier.summary.estateSearchKey) failures.push("Estate-only seed missing summary.estateSearchKey.");
  if (!estateResult.dossier.summary.displayName.startsWith("Estate of Maria Lopez")) failures.push("Estate-only seed did not use estate-first displayName.");
  const podioFields = (estateResult.dossier.crm.payload as { appModel?: { fields?: Record<string, unknown> } })?.appModel?.fields;
  if (podioFields?.estate_name !== "Estate of Maria Lopez") failures.push("Estate-only seed missing Podio estate_name field.");
  if (podioFields?.estate_search_key !== "maria-lopez") failures.push("Estate-only seed missing normalized Podio estate_search_key.");
  if (!estateResult.dossier.probateDocket.reviewTasks.length) failures.push("Estate-only seed missing probate docket review tasks.");

  const caseResult = await runDryPipeline({
    estateName: "Estate of Maria Lopez",
    caseNumber: "2024-CP-001234",
    county: "miami-dade",
    source: "operator_cli",
  });
  if (caseResult.dossier.probateDocket.caseNumber.value !== "2024-CP-001234") failures.push("Case-number seed missing probateDocket.caseNumber.");

  for (const path of Object.values(result.outputs)) {
    if (!existsSync(path)) failures.push(`Expected output missing: ${path}`);
  }
  if (!result.dossier.audit.reviewFlags.includes("NO_ENRICHMENT_RUN")) failures.push("No-enrichment flag missing.");

  const companyDossier = buildS5FixtureDossier({
    runId: "validation-s5-company-owner",
    ownerName: "Estate Holdings LLC",
    ownerType: "company",
  });
  const companyRule = companyDossier.workflow.rules.find((rule) => rule.code === "OWNER_TYPE");
  if (companyRule?.status !== "stop") failures.push("S5 company-owner rule did not stop the lead.");
  if (companyDossier.operatorQueue.state !== "disqualified") failures.push("S5 company-owner fixture did not enter disqualified queue.");

  const recentSaleDossier = buildS5FixtureDossier({
    runId: "validation-s5-recent-sale",
    ownerName: "Fresh Public Source Lead",
    ownerType: "individual_review",
    lastSaleDate: new Date().toISOString().slice(0, 10),
  });
  const recentSaleRule = recentSaleDossier.workflow.rules.find((rule) => rule.code === "RECENT_SALE");
  if (recentSaleRule?.status !== "stop") failures.push("S5 recent-sale rule did not stop the lead.");
  if (recentSaleDossier.operatorQueue.state !== "disqualified") failures.push("S5 recent-sale fixture did not enter disqualified queue.");

  if (failures.length) {
    console.error(JSON.stringify({ ok: false, failures }, null, 2));
    process.exitCode = 1;
    return;
  }

  console.log(JSON.stringify({
    ok: true,
    runId: result.runId,
    facts: result.facts.length,
    outputs: result.outputs,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
