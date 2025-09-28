import type { ElectronAPI } from "@electron-toolkit/preload";
import type { AtomitonRPC } from "#preload/types/api";

// Extended ElectronAPI with conductor IPC support
type ExtendedElectronAPI = ElectronAPI;

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    electron: ExtendedElectronAPI;
    atomitonRPC: AtomitonRPC;
  }
}

export {};
