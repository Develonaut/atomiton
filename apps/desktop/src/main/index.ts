import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { app, BrowserWindow, ipcMain, session, shell } from "electron";
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
      webSecurity: !is.dev, // Disable web security in dev for extension compatibility
      allowRunningInsecureContent: is.dev,
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

  // Install Redux DevTools Extension in development
  if (is.dev) {
    try {
      // Use the new session.defaultSession API for Electron 23+
      const { default: installExtension, REDUX_DEVTOOLS } = await import(
        "electron-devtools-installer"
      );

      // Install with options to suppress warnings
      const extensionId = await installExtension(REDUX_DEVTOOLS, {
        loadExtensionOptions: {
          allowFileAccess: true,
        },
        forceDownload: false,
      });

      console.log("Redux DevTools Extension installed:", extensionId);
    } catch (error) {
      console.error("Failed to install Redux DevTools Extension:", error);
    }
  }

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
