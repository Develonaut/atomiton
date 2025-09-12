import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { app, BrowserWindow, ipcMain, shell, session } from "electron";
import { join } from "path";

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, "../preload/index.mjs"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
    // Open DevTools in development
    if (is.dev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // Always load from a URL - localhost in dev, CDN in production
  const appUrl = is.dev
    ? process.env.ELECTRON_RENDERER_URL || "http://localhost:5173"
    : process.env.ELECTRON_RENDERER_URL || "https://app.atomiton.io"; // TODO: Replace with actual CDN URL

  mainWindow.loadURL(appUrl);
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId("com.electron");

  // DevTools are available via built-in Electron tools
  // Extensions can be installed manually if needed

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.on("ping", () => {
    // Ping handler for testing IPC communication
  });

  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
