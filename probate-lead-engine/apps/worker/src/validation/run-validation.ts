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
  if (!result.dossier.workflow.rules.length) failures.push("Workflow rules missing.");
  if (!result.dossier.workflow.leadQuality.enabledSignals.length) failures.push("Lead-quality settings missing.");
  if (!result.facts.some((item) => item.factType === "owner_type")) failures.push("Owner-type workflow fact missing.");
  if (!result.dossier.taxHistory.manualReceiptTask.required) failures.push("Manual tax receipt fallback missing.");
  if (result.dossier.taxHistory.reviewTasks.length < 5) failures.push("Tax history review tasks missing.");
  if (result.dossier.deedHistory.reviewTasks.length < 7) failures.push("Deed/title review tasks missing.");
  if (!result.dossier.deedHistory.mailingAddressSignal.reviewFlags.includes("MISSING_MAILING_ADDRESS_FACT")) failures.push("Mailing-address review flag missing.");
  if (!result.dossier.deedHistory.orBookPage.reviewFlags.length) failures.push("OR book/page review flags missing.");
  if (!result.dossier.operatorQueue.items.length) failures.push("Operator queue items missing.");
  if (!result.dossier.evidenceQa.checks.length) failures.push("Source evidence QA checks missing.");
  if (result.dossier.evidenceQa.status === "failed") failures.push("Source evidence QA failed.");
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
