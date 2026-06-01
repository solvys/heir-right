import type { HermesConnection, HermesMode } from "./types.js";
import {
  DEFAULT_LOCAL_HERMES_HOST,
  DEFAULT_LOCAL_HERMES_PORTS,
  CLOUD_HERMES_DEFAULT_URL
} from "./types.js";
import { readLocalHermesConfig, resolveHermesPortFromEnv } from "./config.js";

const HEALTH_PATH = "/health";
const STATUS_PATH = "/v1/status";

async function probeHermesHealth(baseUrl: string, timeoutMs = 1500): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    for (const path of [HEALTH_PATH, STATUS_PATH]) {
      const response = await fetch(`${baseUrl}${path}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" }
      });

      if (response.ok) return true;
    }
    return false;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function detectLocalHermesPort(
  host = DEFAULT_LOCAL_HERMES_HOST,
  ports: readonly number[] = DEFAULT_LOCAL_HERMES_PORTS
): Promise<number | null> {
  const config = readLocalHermesConfig();
  const envPort = resolveHermesPortFromEnv();

  const candidates = [
    ...(envPort ? [envPort] : []),
    ...(config?.port ? [config.port] : []),
    ...ports
  ];

  const unique = [...new Set(candidates)];

  for (const port of unique) {
    const baseUrl = `http://${config?.host ?? host}:${port}`;
    if (await probeHermesHealth(baseUrl)) {
      return port;
    }
  }

  return null;
}

export async function connectLocalHermes(): Promise<HermesConnection | null> {
  const config = readLocalHermesConfig();
  const port = await detectLocalHermesPort(config?.host ?? DEFAULT_LOCAL_HERMES_HOST);

  if (!port) return null;

  const host = config?.host ?? DEFAULT_LOCAL_HERMES_HOST;
  const baseUrl = `http://${host}:${port}`;

  return {
    mode: "local",
    baseUrl,
    port,
    healthy: true
  };
}

export async function connectCloudHermes(token?: string): Promise<HermesConnection> {
  const baseUrl = process.env.CLOUD_HERMES_URL ?? CLOUD_HERMES_DEFAULT_URL;
  const healthy = token ? await probeHermesHealth(baseUrl) : false;

  return {
    mode: "cloud",
    baseUrl,
    healthy
  };
}

export async function resolveHermesConnection(options: {
  preferLocal?: boolean;
  cloudToken?: string;
}): Promise<{ connection: HermesConnection; mode: HermesMode }> {
  const preferLocal = options.preferLocal ?? true;

  if (preferLocal) {
    const local = await connectLocalHermes();
    if (local) {
      return { connection: local, mode: "local" };
    }
  }

  const cloud = await connectCloudHermes(options.cloudToken);
  return { connection: cloud, mode: "cloud" };
}
