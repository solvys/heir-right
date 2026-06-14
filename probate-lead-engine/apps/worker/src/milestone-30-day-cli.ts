import { generateThirtyDayMilestoneEvidence, renderThirtyDayMilestoneEvidenceMarkdown } from "./milestone/thirty-day-evidence";
import { writeJsonOutput, writeTextOutput } from "./storage/write-output";

generateThirtyDayMilestoneEvidence()
  .then((evidence) => {
    const jsonPath = writeJsonOutput("thirty-day-milestone-evidence.json", evidence);
    const markdownPath = writeTextOutput("thirty-day-milestone-evidence.md", renderThirtyDayMilestoneEvidenceMarkdown(evidence));
    console.log(JSON.stringify({
      ok: true,
      milestone: evidence.milestone,
      overallStatus: evidence.overallStatus,
      blockedGateCount: evidence.gates.filter((gate) => gate.status === "blocked").length,
      rawLeadCount: evidence.dailyRun.rawLeadCount,
      qualifiedLeadCount: evidence.dailyRun.qualifiedLeadCount,
      outputs: {
        json: jsonPath,
        markdown: markdownPath,
      },
    }, null, 2));
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
