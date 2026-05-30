import { runDryPipeline } from "./index";
import { persistOutput } from "./storage/write-output";

runDryPipeline()
  .then((result) => {
    for (const output of Object.values(result.outputFiles)) persistOutput(output);

    console.log(JSON.stringify({
      ok: true,
      runId: result.runId,
      status: result.dossier.status,
      workflowStatus: result.dossier.workflow.status,
      operatorQueueState: result.dossier.operatorQueue.state,
      displayName: result.dossier.summary.displayName,
      nextBestAction: result.dossier.summary.nextBestAction,
      reviewFlags: result.dossier.audit.reviewFlags,
      outputs: result.outputs,
    }, null, 2));
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
