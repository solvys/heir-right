import { existsSync } from "node:fs";
import { runDryPipeline } from "../index";
import { persistOutput } from "../storage/write-output";

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
  for (const path of Object.values(result.outputs)) {
    if (!existsSync(path)) failures.push(`Expected output missing: ${path}`);
  }
  if (!result.dossier.audit.reviewFlags.includes("NO_ENRICHMENT_RUN")) failures.push("No-enrichment flag missing.");

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
