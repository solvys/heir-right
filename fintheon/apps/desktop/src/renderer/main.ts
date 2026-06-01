type HermesStatus = {
  mode: "local" | "cloud";
  connection: {
    mode: "local" | "cloud";
    baseUrl: string;
    port?: number;
    healthy: boolean;
  } | null;
};

declare global {
  interface Window {
    fintheon: {
      getHermesStatus: () => Promise<HermesStatus>;
      reconnectHermes: (cloudToken?: string) => Promise<HermesStatus>;
      executeHermesAction: (action: string, payload?: Record<string, unknown>) => Promise<{ ok: boolean; error?: string; result?: unknown }>;
      getAppVersion: () => Promise<string>;
      onUpdateAvailable: (callback: () => void) => void;
      onUpdateDownloaded: (callback: () => void) => void;
    };
  }
}

const modeBadge = document.getElementById("mode-badge")!;
const headline = document.getElementById("headline")!;
const statusCopy = document.getElementById("status-copy")!;
const connectionDetail = document.getElementById("connection-detail")!;
const actionResult = document.getElementById("action-result")!;
const versionEl = document.getElementById("version")!;
const updateBanner = document.getElementById("update-banner")!;

function renderStatus(status: HermesStatus): void {
  const { mode, connection } = status;

  modeBadge.className = `badge ${mode}`;
  modeBadge.textContent = mode === "local" ? "Local Hermes" : "Cloud Hermes";

  if (mode === "local" && connection?.port) {
    headline.textContent = "Connected to Local Hermes";
    statusCopy.textContent =
      "All local agentic actions in Fintheon route through Hermes on your machine.";
    connectionDetail.textContent = `baseUrl: ${connection.baseUrl}\nport: ${connection.port}\nhealthy: ${connection.healthy}`;
  } else {
    headline.textContent = "Using Cloud Hermes";
    statusCopy.textContent =
      "Local Hermes was not detected. Configure ~/.hermes/config.json and re-scan, or continue with Cloud Hermes.";
    connectionDetail.textContent = connection
      ? `baseUrl: ${connection.baseUrl}\nhealthy: ${connection.healthy}`
      : "No connection";
  }
}

async function init(): Promise<void> {
  const version = await window.fintheon.getAppVersion();
  versionEl.textContent = `v${version}`;

  const status = await window.fintheon.getHermesStatus();
  renderStatus(status);

  window.fintheon.onUpdateDownloaded(() => {
    updateBanner.classList.remove("hidden");
  });
}

document.getElementById("reconnect-btn")!.addEventListener("click", async () => {
  actionResult.textContent = "Re-scanning…";
  const status = await window.fintheon.reconnectHermes();
  renderStatus(status);
  actionResult.textContent = "Scan complete.";
});

document.getElementById("ping-btn")!.addEventListener("click", async () => {
  actionResult.textContent = "Pinging…";
  const result = await window.fintheon.executeHermesAction("ping");
  actionResult.textContent = result.ok ? "Hermes responded." : `Error: ${result.error}`;
});

void init();
