import { runDailyProduction } from "./daily/run-daily";
import { jsonOutput } from "./storage/output-manifest";
import { persistOutput } from "./storage/write-output";

runDailyProduction()
  .then((result) => {
    const output = jsonOutput("daily-run.json", result);
    persistOutput(output);
    console.log(JSON.stringify({
      ok: result.errorCount === 0,
      id: result.id,
      counties: result.config.counties,
      rawLeadCount: result.rawLeadCount,
      qualifiedLeadCount: result.qualifiedLeadCount,
      reviewLeadCount: result.reviewLeadCount,
      duplicateCount: result.duplicateCount,
      errorCount: result.errorCount,
      missedVolumeReasons: result.missedVolumeReasons,
      output: output.path,
    }, null, 2));
    if (result.errorCount > 0) process.exitCode = 1;
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
