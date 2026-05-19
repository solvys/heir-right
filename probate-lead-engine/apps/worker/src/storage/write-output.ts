import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { PipelineOutput } from "./output-manifest";

function outputDir(): string {
  return join(process.cwd(), "output");
}

export function writeJsonOutput(name: string, data: unknown): string {
  const dir = outputDir();
  mkdirSync(dir, { recursive: true });
  const path = join(dir, name);
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
  return path;
}

export function writeTextOutput(name: string, data: string): string {
  const dir = outputDir();
  mkdirSync(dir, { recursive: true });
  const path = join(dir, name);
  writeFileSync(path, data);
  return path;
}

export function persistOutput(output: PipelineOutput): string {
  const dir = outputDir();
  mkdirSync(dir, { recursive: true });
  writeFileSync(output.path, output.body);
  return output.path;
}
