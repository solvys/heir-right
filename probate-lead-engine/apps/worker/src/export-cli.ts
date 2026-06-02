import { runDryPipeline } from "./index";
import { exportCompletedReport } from "./export/export-package";
import { jsonOutput } from "./storage/output-manifest";
import { persistOutput } from "./storage/write-output";

const dryRunEnv = {
  ...process.env,
  GOOGLE_WORKSPACE_ACCESS_TOKEN: process.env.GOOGLE_WORKSPACE_ACCESS_TOKEN ?? "dry-run-google-token",
  GOOGLE_TRACKING_SHEET_ID: process.env.GOOGLE_TRACKING_SHEET_ID ?? "dry-run-sheet",
  PODIO_ACCESS_TOKEN: process.env.PODIO_ACCESS_TOKEN ?? "dry-run-podio-token",
  PODIO_APP_ID: process.env.PODIO_APP_ID ?? "dry-run-app",
  PODIO_FIELD_MAP_JSON: process.env.PODIO_FIELD_MAP_JSON ?? JSON.stringify({
    title: "title",
    property_address: "property_address",
    county: "county",
    lead_bucket: "lead_bucket",
    report_link: "report_link",
  }),
};

runDryPipeline()
  .then((pipeline) => exportCompletedReport({
    routes: ["google", "podio"],
    dossier: pipeline.dossier,
    dryRun: true,
  }, dryRunEnv))
  .then((result) => {
    const output = jsonOutput("export-result.json", result);
    persistOutput(output);
    console.log(JSON.stringify({
      ok: result.ok,
      routes: result.routes.map((route) => ({
        route: route.route,
        ok: route.ok,
        mode: route.mode,
        readbackOk: route.readbackOk,
        blockers: route.blockers,
      })),
      blockers: result.blockers,
      output: output.path,
    }, null, 2));
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
