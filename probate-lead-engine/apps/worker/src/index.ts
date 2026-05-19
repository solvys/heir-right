import type { IntakeSeed, RawDossier, SourceFact } from "@ple/types";
import { fetchOfficialRecordFacts } from "./adapters/official-records";
import { fetchPropertyFacts } from "./adapters/property-appraiser";
import { PodioAdapter } from "./crm/podio-adapter";
import { buildRawDossier } from "./dossier/build-raw-dossier";
import { generateInternalSummary } from "./documents/internal-summary";
import { fact, nowIso, slug } from "./lib";
import { jsonOutput, PipelineOutput, textOutput } from "./storage/output-manifest";

type RuntimeEnv = Record<string, string | undefined>;

export interface RunDryPipelineOptions {
  env?: RuntimeEnv;
}

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((item) => item.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

function seedFromArgs(): IntakeSeed {
  const propertyAddress = arg("address") ?? "3850 NW 176th St, Miami Gardens, FL 33055";
  return {
    propertyAddress,
    ownerName: arg("owner") ?? "Fresh public-source lead",
    county: arg("county") ?? "miami-dade",
    parcelId: arg("folio"),
    source: "operator_cli",
  };
}

export async function runDryPipeline(seed: IntakeSeed = seedFromArgs(), options: RunDryPipelineOptions = {}): Promise<{
  runId: string;
  facts: SourceFact[];
  dossier: RawDossier;
  outputs: Record<string, string>;
  outputFiles: Record<string, PipelineOutput>;
}> {
  const runId = `run-${Date.now()}-${slug(seed.propertyAddress)}`;
  const intakeFact = fact({
    runId,
    source: "intake",
    rawId: `intake:${slug(seed.propertyAddress)}`,
    fetchedAt: nowIso(),
    county: seed.county,
    subject: {
      ownerName: seed.ownerName,
      propertyAddress: seed.propertyAddress,
      parcelId: seed.parcelId,
      county: seed.county,
    },
    factType: "intake_seed",
    value: seed,
    confidence: 0.95,
    reviewFlags: ["NO_ENRICHMENT_RUN"],
  });

  const [propertyFacts, officialRecordFacts] = await Promise.all([
    fetchPropertyFacts(runId, seed),
    fetchOfficialRecordFacts(runId, seed),
  ]);
  const facts = [intakeFact, ...propertyFacts, ...officialRecordFacts];
  const propertyCountyFact = fact({
    runId,
    source: "property_appraiser",
    rawId: `property-search:${slug(seed.propertyAddress)}:county`,
    fetchedAt: nowIso(),
    county: seed.county,
    subject: {
      ownerName: seed.ownerName,
      propertyAddress: seed.propertyAddress,
      parcelId: seed.parcelId,
      county: seed.county,
    },
    factType: "property_county",
    value: seed.county,
    confidence: 0.8,
    reviewFlags: ["NO_ENRICHMENT_RUN"],
  });
  facts.push(propertyCountyFact);

  const dossier = buildRawDossier(runId, facts);
  const podio = new PodioAdapter(options.env);
  const podioPayload = await podio.dryRun(dossier);
  dossier.crm.payload = podioPayload;
  dossier.documentPacket = generateInternalSummary(dossier);

  const outputFiles = {
    latestRun: jsonOutput("latest-run.json", { runId, seed, facts, dossier }),
    dossier: jsonOutput("latest-dossier.json", dossier),
    podio: jsonOutput("podio-dry-run.json", podioPayload),
    summaryMarkdown: textOutput("internal-summary.md", dossier.documentPacket.formats.markdown),
    summaryHtml: textOutput("internal-summary.html", dossier.documentPacket.formats.html, "text/html; charset=utf-8"),
  };
  const outputs = {
    latestRun: outputFiles.latestRun.path,
    dossier: outputFiles.dossier.path,
    podio: outputFiles.podio.path,
    summaryMarkdown: outputFiles.summaryMarkdown.path,
    summaryHtml: outputFiles.summaryHtml.path,
  };

  return { runId, facts, dossier, outputs, outputFiles };
}
