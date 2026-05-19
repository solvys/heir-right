export type PipelineOutputName =
  | "latest-run.json"
  | "latest-dossier.json"
  | "podio-dry-run.json"
  | "internal-summary.md"
  | "internal-summary.html";

export interface PipelineOutput {
  path: string;
  contentType: string;
  body: string;
}

export function jsonOutput(name: PipelineOutputName, data: unknown): PipelineOutput {
  return {
    path: `output/${name}`,
    contentType: "application/json; charset=utf-8",
    body: `${JSON.stringify(data, null, 2)}\n`,
  };
}

export function textOutput(name: PipelineOutputName, data: string, contentType = "text/plain; charset=utf-8"): PipelineOutput {
  return {
    path: `output/${name}`,
    contentType,
    body: data,
  };
}
