declare global {
  interface Window {
    electron?: {
      ipcRenderer: {
        send: (channel: string, data: unknown) => void;
        on: (channel: string, func: (...args: unknown[]) => void) => void;
        removeAllListeners: (channel: string) => void;
      };
    };
  }
}

export {};
