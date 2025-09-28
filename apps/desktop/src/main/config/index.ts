import { is } from "@electron-toolkit/utils";
import { app } from "electron";
import { join } from "path";

export type DesktopConfig = {
  app: {
    name: string;
    userModelId: string;
    isDev: boolean;
  };
  window: {
    width: number;
    height: number;
    preloadPath: string;
    appUrl: string;
    isHeadless: boolean;
  };
};

export type ConfigManager = {
  getConfig: () => DesktopConfig;
};

const resolveAppUrl = (isDev: boolean): string => {
  const appUrl = isDev
    ? process.env.ELECTRON_RENDERER_URL || "http://localhost:5173"
    : process.env.ELECTRON_RENDERER_URL || "https://app.atomiton.io";

  console.log(`[DESKTOP] Loading UI from: ${appUrl} (dev mode: ${isDev})`);
  return appUrl;
};

const loadConfig = (): DesktopConfig => {
  const isDev = is.dev;
  const isHeadless =
    app.commandLine.hasSwitch("headless") ||
    app.commandLine.hasSwitch("hidden");

  return {
    app: {
      name: "AtomitonDesktop",
      userModelId: "com.atomiton.desktop",
      isDev,
    },
    window: {
      width: 1200,
      height: 800,
      preloadPath: join(__dirname, "../preload/index.js"),
      appUrl: resolveAppUrl(isDev),
      isHeadless,
    },
  };
};

export function createConfigManager(): ConfigManager {
  const config = loadConfig();

  const getConfig = (): DesktopConfig => {
    return config;
  };

  return {
    getConfig,
  };
}
