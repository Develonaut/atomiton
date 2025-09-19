import type { ElectronAPI } from "@electron-toolkit/preload";

// Extended ElectronAPI with conductor IPC support
type ExtendedElectronAPI = ElectronAPI & {
  ipcRenderer: {
    send: (channel: string, data: unknown) => void;
    on: (channel: string, func: (...args: unknown[]) => void) => void;
    removeAllListeners: (channel: string) => void;
  };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    electron: ExtendedElectronAPI;
    api: {
      isMaximized?: () => Promise<boolean>;
    };
  }
}

export {};
