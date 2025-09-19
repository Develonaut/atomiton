import type { ElectronAPI } from "@electron-toolkit/preload";

// Extended ElectronAPI with conductor IPC support
type ExtendedElectronAPI = ElectronAPI;

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    electron: ExtendedElectronAPI;
  }
}

export {};
