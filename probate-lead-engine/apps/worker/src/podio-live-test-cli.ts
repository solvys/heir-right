import { exportCompletedReport } from "./export/export-package";
import { runDryPipeline } from "./index";
import { jsonOutput } from "./storage/output-manifest";
import { persistOutput } from "./storage/write-output";

const testTitle = `HEIRRIGHT TEST - DO NOT WORK - ${new Date().toISOString()}`;

runDryPipeline({
  estateName: testTitle,
  propertyAddress: process.env.PODIO_TEST_PROPERTY_ADDRESS ?? "20611 NW 33rd Pl, Miami Gardens, FL 33056",
  ownerName: "HeirRight controlled API test",
  caseNumber: process.env.PODIO_TEST_CASE_NUMBER ?? "HEIRRIGHT-TEST",
  county: process.env.PODIO_TEST_COUNTY ?? "miami-dade",
  source: "operator_cli",
})
  .then((pipeline) => exportCompletedReport({
    routes: ["podio"],
    dossier: pipeline.dossier,
    dryRun: false,
  }, process.env))
  .then((result) => {
    const output = jsonOutput("podio-live-export-result.json", result);
    persistOutput(output);
    const podioRoute = result.routes.find((route) => route.route === "podio");
    console.log(JSON.stringify({
      ok: result.ok,
      testTitle,
      mode: podioRoute?.mode,
      routeOk: podioRoute?.ok,
      readbackOk: podioRoute?.readbackOk,
      externalId: podioRoute?.externalId,
      url: podioRoute?.url,
      blockers: result.blockers,
      output: output.path,
    }, null, 2));
    if (!result.ok) process.exitCode = 1;
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
