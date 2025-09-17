declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
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
