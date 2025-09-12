import type { ElectronAPI } from "@electron-toolkit/preload";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      isMaximized?: () => Promise<boolean>;
    };
  }
}

export {};
