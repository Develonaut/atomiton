import type { BrowserWindow } from "electron";
import { session } from "electron";

export type DevToolsManager = {
  setupReduxDevTools: (window: BrowserWindow) => Promise<void>;
};

const installReduxExtension = async (): Promise<void> => {
  const existingExtensions =
    session.defaultSession.extensions.getAllExtensions();
  const isInstalled = existingExtensions.some(
    (ext) => ext.id === "lmhkpmbekcpmknklioeibfkpmmfibljd",
  );

  if (!isInstalled) {
    const { default: installExtension, REDUX_DEVTOOLS } = await import(
      "electron-devtools-installer"
    );

    await installExtension(REDUX_DEVTOOLS, {
      loadExtensionOptions: {
        allowFileAccess: true,
      },
      forceDownload: false,
    });
  }
};

export function createDevToolsManager(): DevToolsManager {
  const setupReduxDevTools = async (window: BrowserWindow): Promise<void> => {
    if (!process.env.CI && !process.env.LEFTHOOK) {
      window.webContents.once("dom-ready", async () => {
        try {
          await installReduxExtension();
          window.webContents.openDevTools();
        } catch (error) {
          console.error("Failed to load Redux DevTools:", error);
          window.webContents.openDevTools();
        }
      });
    }
  };

  return {
    setupReduxDevTools,
  };
}
