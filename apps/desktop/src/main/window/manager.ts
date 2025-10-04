import { BrowserWindow, shell } from "electron";

export type WindowConfig = {
  width?: number;
  height?: number;
  show?: boolean;
  autoHideMenuBar?: boolean;
  preloadPath: string;
  appUrl: string;
  isHeadless?: boolean;
};

export type WindowManager = {
  createMainWindow: (config: WindowConfig) => BrowserWindow;
  getMainWindow: () => BrowserWindow | null;
};

export function createWindowManager(): WindowManager {
  let mainWindow: BrowserWindow | null = null;

  const setupWindowEvents = (
    window: BrowserWindow,
    isHeadless: boolean,
  ): void => {
    window.on("ready-to-show", () => {
      if (!isHeadless) {
        window.show();
      }
    });

    window.webContents.on("did-finish-load", () => {
      console.log("Page finished loading");
    });

    window.webContents.on(
      "did-fail-load",
      (event, errorCode, errorDescription) => {
        console.error(
          `Page failed to load: ${errorDescription} (code: ${errorCode})`,
        );
      },
    );
  };

  const setupSecurityHandlers = (window: BrowserWindow): void => {
    window.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return { action: "deny" };
    });
  };

  const loadUrl = (window: BrowserWindow, appUrl: string): void => {
    console.log(`[DESKTOP] Loading UI from: ${appUrl}`);
    window.loadURL(appUrl);
  };

  const createMainWindow = (config: WindowConfig): BrowserWindow => {
    mainWindow = new BrowserWindow({
      width: config.width ?? 1920,
      height: config.height ?? 1080,
      show: config.show ?? false,
      autoHideMenuBar: config.autoHideMenuBar ?? true,
      webPreferences: {
        preload: config.preloadPath,
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: true,
        allowRunningInsecureContent: false,
      },
    });

    setupWindowEvents(mainWindow, config.isHeadless ?? false);
    setupSecurityHandlers(mainWindow);
    loadUrl(mainWindow, config.appUrl);

    return mainWindow;
  };

  const getMainWindow = (): BrowserWindow | null => {
    return mainWindow;
  };

  return {
    createMainWindow,
    getMainWindow,
  };
}
