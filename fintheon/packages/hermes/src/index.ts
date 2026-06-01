export type {
  HermesMode,
  HermesConfig,
  HermesConnection,
  HermesActionRequest,
  HermesActionResponse
} from "./types.js";

export {
  DEFAULT_LOCAL_HERMES_PORTS,
  DEFAULT_LOCAL_HERMES_HOST,
  HERMES_CONFIG_PATHS,
  CLOUD_HERMES_DEFAULT_URL
} from "./types.js";

export { readLocalHermesConfig, resolveHermesPortFromEnv } from "./config.js";

export {
  detectLocalHermesPort,
  connectLocalHermes,
  connectCloudHermes,
  resolveHermesConnection
} from "./discovery.js";

export { HermesClient, createHermesClient } from "./client.js";
