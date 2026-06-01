import { contextBridge, ipcRenderer } from "electron";

export type HermesStatus = {
  mode: "local" | "cloud";
  connection: {
    mode: "local" | "cloud";
    baseUrl: string;
    port?: number;
    healthy: boolean;
  } | null;
};

contextBridge.exposeInMainWorld("fintheon", {
  getHermesStatus: (): Promise<HermesStatus> => ipcRenderer.invoke("hermes:get-status"),
  reconnectHermes: (cloudToken?: string): Promise<HermesStatus> =>
    ipcRenderer.invoke("hermes:reconnect", cloudToken),
  executeHermesAction: (action: string, payload?: Record<string, unknown>) =>
    ipcRenderer.invoke("hermes:execute", action, payload),
  getAppVersion: (): Promise<string> => ipcRenderer.invoke("app:get-version"),
  onUpdateAvailable: (callback: () => void) => {
    ipcRenderer.on("update:available", callback);
  },
  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on("update:downloaded", callback);
  }
});
