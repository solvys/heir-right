import { runDryPipeline } from "./index";
import { persistOutput } from "./storage/write-output";

runDryPipeline()
  .then((result) => {
    for (const output of Object.values(result.outputFiles)) persistOutput(output);

    console.log(JSON.stringify({
      ok: true,
      runId: result.runId,
      status: result.dossier.status,
      displayName: result.dossier.summary.displayName,
      reviewFlags: result.dossier.audit.reviewFlags,
      outputs: result.outputs,
    }, null, 2));
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
