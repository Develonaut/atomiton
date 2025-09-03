import * as path from "path";
import * as url from "url";

import { app, BrowserWindow, protocol, ipcMain } from "electron";

import { setupIpcHandlers } from "./ipc/handlers";
import { initializeLogger } from "./utils/logger";

let mainWindow: BrowserWindow | null = null;

const logger = initializeLogger();

const isDevelopment = process.env.NODE_ENV !== "production";

const UI_HOST = process.env.UI_HOST || "localhost";
const UI_PORT = process.env.UI_PORT || "5177";
let VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

if (!VITE_DEV_SERVER_URL && isDevelopment) {
  VITE_DEV_SERVER_URL = `http://${UI_HOST}:${UI_PORT}`;
  console.log(`[Electron] Dev server URL: ${VITE_DEV_SERVER_URL}`);
}

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true, stream: true } },
]);

function createWindow() {
  logger.info("Electron", "Creating main window");
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: "Atomiton",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    titleBarStyle: "hiddenInset",
    icon: path.join(__dirname, "../../../apps/client/public/icon.png"),
  });

  if (isDevelopment) {
    mainWindow.webContents.session.webRequest.onHeadersReceived(
      (details, callback) => {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            "Content-Security-Policy": [
              "default-src 'self' http://localhost:* ws://localhost:*; " +
                "script-src 'self' 'unsafe-inline' http://localhost:*; " +
                "style-src 'self' 'unsafe-inline' http://localhost:*; " +
                "img-src 'self' data: http://localhost:*; " +
                "font-src 'self' data: http://localhost:*;",
            ],
          },
        });
      },
    );

    const devServerUrl = VITE_DEV_SERVER_URL || `http://${UI_HOST}:${UI_PORT}`;
    logger.info("Electron", `Loading dev server from ${devServerUrl}`);
    mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.webContents.session.webRequest.onHeadersReceived(
      (details, callback) => {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            "Content-Security-Policy": [
              "default-src 'self'; " +
                "script-src 'self'; " +
                "style-src 'self' 'unsafe-inline'; " +
                "img-src 'self' data:; " +
                "font-src 'self' data:; " +
                "connect-src 'self' ws://localhost:* http://localhost:*;",
            ],
          },
        });
      },
    );

    const prodUrl = url.format({
      pathname: path.join(__dirname, "../../../apps/client/dist/index.html"),
      protocol: "file:",
      slashes: true,
    });
    logger.info("Electron", `Loading production build from ${prodUrl}`);
    mainWindow.loadURL(prodUrl);
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  logger.warn("Electron", "Another instance is already running. Exiting...");
  app.quit();
  process.exit(0);
}

app.on("second-instance", (_event, _commandLine, _workingDirectory) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.whenReady().then(() => {
  logger.info("Electron", "Application ready, initializing...");
  createWindow();

  if (mainWindow) {
    setupIpcHandlers(ipcMain, mainWindow);
    logger.info("Electron", "IPC handlers configured");
  }

  logger.info("Electron", "Application initialized successfully");

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  logger.info("Electron", "All windows closed");
  if (process.platform !== "darwin") {
    logger.info("Electron", "Quitting application");
    app.quit();
  }
});

app.on("before-quit", () => {
  logger.info("Electron", "Application shutting down");
  logger.close();
});
