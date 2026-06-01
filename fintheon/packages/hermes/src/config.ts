import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { HermesConfig } from "./types.js";
import { HERMES_CONFIG_PATHS } from "./types.js";

function expandHome(path: string): string {
  return path.startsWith("~/") ? join(homedir(), path.slice(2)) : path;
}

export function readLocalHermesConfig(): HermesConfig | null {
  for (const configPath of HERMES_CONFIG_PATHS) {
    const resolved = expandHome(configPath);
    if (!existsSync(resolved)) continue;

    try {
      const raw = readFileSync(resolved, "utf8");
      const parsed = JSON.parse(raw) as HermesConfig;
      return parsed;
    } catch {
      continue;
    }
  }

  return null;
}

export function resolveHermesPortFromEnv(): number | undefined {
  const raw = process.env.HERMES_PORT ?? process.env.LOCAL_HERMES_PORT;
  if (!raw) return undefined;

  const port = Number.parseInt(raw, 10);
  return Number.isFinite(port) && port > 0 && port <= 65535 ? port : undefined;
}
