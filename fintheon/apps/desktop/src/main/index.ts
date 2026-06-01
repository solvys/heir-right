import { app, BrowserWindow, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import { join } from "node:path";
import {
  connectCloudHermes,
  connectLocalHermes,
  createHermesClient,
  type HermesConnection,
  type HermesMode
} from "@fintheon/hermes";

let mainWindow: BrowserWindow | null = null;
let activeConnection: HermesConnection | null = null;
let activeMode: HermesMode = "local";

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 640,
    minWidth: 720,
    minHeight: 480,
    title: "Fintheon",
    backgroundColor: "#050810",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

async function bootstrapHermes(cloudToken?: string): Promise<void> {
  const local = await connectLocalHermes();

  if (local) {
    activeConnection = local;
    activeMode = "local";
    return;
  }

  activeConnection = await connectCloudHermes(cloudToken);
  activeMode = "cloud";
}

function setupAutoUpdater(): void {
  if (!app.isPackaged) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("update-available", () => {
    mainWindow?.webContents.send("update:available");
  });

  autoUpdater.on("update-downloaded", () => {
    mainWindow?.webContents.send("update:downloaded");
  });

  autoUpdater.on("error", (error) => {
    mainWindow?.webContents.send("update:error", error.message);
  });

  autoUpdater.checkForUpdatesAndNotify().catch(() => {
    // Non-fatal — user may be offline
  });
}

function setupIpc(): void {
  ipcMain.handle("hermes:get-status", () => ({
    mode: activeMode,
    connection: activeConnection
  }));

  ipcMain.handle("hermes:reconnect", async (_event, cloudToken?: string) => {
    await bootstrapHermes(cloudToken);
    return { mode: activeMode, connection: activeConnection };
  });

  ipcMain.handle(
    "hermes:execute",
    async (_event, action: string, payload?: Record<string, unknown>) => {
      if (!activeConnection) {
        return { ok: false, error: "No Hermes connection available" };
      }

      const client = createHermesClient(activeConnection);
      return client.execute({ action, payload });
    }
  );

  ipcMain.handle("app:get-version", () => app.getVersion());
}

app.whenReady().then(async () => {
  setupIpc();
  await bootstrapHermes();
  createWindow();
  setupAutoUpdater();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
