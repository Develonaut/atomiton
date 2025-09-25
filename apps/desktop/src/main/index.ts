import { initializeServices } from "@/main/services";
import { createDesktopLogger } from "@atomiton/logger/desktop";
import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { app, BrowserWindow, ipcMain, session, shell } from "electron";
import { join } from "path";

const logger = createDesktopLogger({ namespace: "desktop:main" });
logger.info("Desktop application starting up");

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: true, // Keep sandbox enabled for security
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true, // Always enable web security
      allowRunningInsecureContent: false, // Never allow insecure content
    },
  });

  mainWindow.on("ready-to-show", () => {
    logger.info("Window ready to show");
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // Install Redux DevTools after DOM is ready
  if (is.dev) {
    mainWindow.webContents.once("dom-ready", async () => {
      try {
        // Check if extension is already installed
        const existingExtensions =
          session.defaultSession.extensions.getAllExtensions();
        const isInstalled = existingExtensions.some(
          (ext) => ext.id === "lmhkpmbekcpmknklioeibfkpmmfibljd",
        );

        if (!isInstalled) {
          // Try to load from the electron-devtools-installer cache
          const { default: installExtension, REDUX_DEVTOOLS } = await import(
            "electron-devtools-installer"
          );

          // Install the extension (downloads it if needed)
          await installExtension(REDUX_DEVTOOLS, {
            loadExtensionOptions: {
              allowFileAccess: true,
            },
            forceDownload: false,
          });
        }

        // Only open dev tools when not running in CI/hooks (for snapshots/integration tests)
        if (!process.env.CI && !process.env.LEFTHOOK) {
          mainWindow?.webContents.openDevTools();
        }
      } catch (error) {
        console.error("Failed to load Redux DevTools:", error);
        // Only open dev tools when not running in CI/hooks (for snapshots/integration tests)
        if (!process.env.CI && !process.env.LEFTHOOK) {
          mainWindow?.webContents.openDevTools();
        }
      }
    });
  }

  // Always load from a URL - localhost in dev, CDN in production
  const appUrl = is.dev
    ? process.env.ELECTRON_RENDERER_URL || "http://localhost:5173"
    : process.env.ELECTRON_RENDERER_URL || "https://app.atomiton.io"; // TODO: Replace with actual CDN URL

  mainWindow?.loadURL(appUrl);
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Set app name and user data directory for better process identification
app.setName("AtomitonDesktop");
if (is.dev) {
  // In development, add a unique identifier to help with process management
  app.setPath("userData", join(app.getPath("userData"), "AtomitonDev"));
}

app.whenReady().then(async () => {
  logger.info("Electron app ready, initializing desktop application");
  electronApp.setAppUserModelId("com.atomiton.desktop");

  // Initialize application services
  logger.info("Initializing application services");
  initializeServices();
  logger.info("Application services initialized");

  // Set a proper CSP for development that allows DevTools but maintains security
  if (is.dev) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      const responseHeaders = { ...details.responseHeaders };
      // Set a CSP that allows DevTools extension while maintaining security
      // Redux DevTools extension ID: lmhkpmbekcpmknklioeibfkpmmfibljd
      responseHeaders["Content-Security-Policy"] = [
        [
          "default-src 'self' http://localhost:* ws://localhost:*",
          "script-src 'self' 'unsafe-inline' http://localhost:* chrome-extension://lmhkpmbekcpmknklioeibfkpmmfibljd",
          "style-src 'self' 'unsafe-inline' http://localhost:* https://fonts.googleapis.com",
          "img-src 'self' data: http://localhost:* chrome-extension://lmhkpmbekcpmknklioeibfkpmmfibljd",
          "connect-src 'self' ws://localhost:* http://localhost:* chrome-extension://lmhkpmbekcpmknklioeibfkpmmfibljd",
          "font-src 'self' data: https://fonts.gstatic.com",
        ].join("; "),
      ];
      callback({ responseHeaders });
    });
  } else {
    // Production CSP - stricter
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      const responseHeaders = { ...details.responseHeaders };
      responseHeaders["Content-Security-Policy"] = [
        [
          "default-src 'self'",
          "script-src 'self'",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // May need unsafe-inline for some React styles
          "img-src 'self' data: https:",
          "connect-src 'self' https:",
          "font-src 'self' data: https://fonts.gstatic.com",
        ].join("; "),
      ];
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
