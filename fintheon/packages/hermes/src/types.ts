export type HermesMode = "local" | "cloud";

export type HermesConfig = {
  port?: number;
  host?: string;
  apiKey?: string;
};

export type HermesConnection = {
  mode: HermesMode;
  baseUrl: string;
  port?: number;
  healthy: boolean;
};

export type HermesActionRequest = {
  action: string;
  payload?: Record<string, unknown>;
};

export type HermesActionResponse = {
  ok: boolean;
  result?: unknown;
  error?: string;
};

export const DEFAULT_LOCAL_HERMES_PORTS = [8765, 8080, 3000, 5173, 4000] as const;

export const DEFAULT_LOCAL_HERMES_HOST = "127.0.0.1";

export const HERMES_CONFIG_PATHS = [
  "~/.hermes/config.json",
  "~/.config/hermes/config.json"
] as const;

export const CLOUD_HERMES_DEFAULT_URL = "https://cloud-hermes.fintheon.io";
