import type { ElectronAPI } from "@electron-toolkit/preload";

// Extended ElectronAPI with conductor IPC support
type ExtendedElectronAPI = ElectronAPI;

// Minimal channel bridge interface
type AtomitonBridge = {
  call: (channel: string, command: string, args?: unknown) => Promise<unknown>;
  listen: (
    channel: string,
    event: string,
    callback: (data: unknown) => void,
  ) => () => void;
  send: (channel: string, event: string, data?: unknown) => void;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    electron: ExtendedElectronAPI;
    atomitonBridge: AtomitonBridge;
  }
}

export {};
