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
      sandbox: true, // Keep sandbox enabled for security
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: !is.dev, // Disable web security in dev for extension compatibility
      allowRunningInsecureContent: is.dev,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // Install Redux DevTools after DOM is ready
  if (is.dev) {
    mainWindow.webContents.once("dom-ready", async () => {
      try {
        const { default: installExtension, REDUX_DEVTOOLS } = await import(
          "electron-devtools-installer"
        );

        await installExtension(REDUX_DEVTOOLS, {
          loadExtensionOptions: {
            allowFileAccess: true,
          },
          forceDownload: false,
        })
          .then((name) => console.log(`Added Extension: ${name}`))
          .catch((err) => console.log("Extension install error: ", err))
          .finally(() => {
            mainWindow.webContents.openDevTools();
          });
      } catch (error) {
        console.error("Failed to load devtools installer:", error);
        mainWindow.webContents.openDevTools();
      }
    });
  }

  // Always load from a URL - localhost in dev, CDN in production
  const appUrl = is.dev
    ? process.env.ELECTRON_RENDERER_URL || "http://localhost:5173"
    : process.env.ELECTRON_RENDERER_URL || "https://app.atomiton.io"; // TODO: Replace with actual CDN URL

  mainWindow.loadURL(appUrl);
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId("com.electron");

  // Remove CSP restrictions in development to allow extensions
  if (is.dev) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      const responseHeaders = { ...details.responseHeaders };
      delete responseHeaders["content-security-policy"];
      delete responseHeaders["Content-Security-Policy"];
      callback({ responseHeaders });
    });
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
