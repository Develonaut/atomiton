export type IPCEvent = {
  channel: string;
  data: unknown;
};

export type IPCBridge = {
  send(channel: string, data: unknown): void;
  on(channel: string, handler: (event: IPCEvent) => void): () => void;
  isAvailable(): boolean;
  getEnvironment(): "renderer" | "main" | null;
};

export type IPCContext = {
  environment: "renderer" | "main" | null;
  handlers: Map<string, Set<(event: IPCEvent) => void>>;
  ipcRenderer?: {
    send: (channel: string, data: unknown) => void;
    on: (
      channel: string,
      listener: (event: unknown, data: unknown) => void,
    ) => void;
    off?: (
      channel: string,
      listener: (event: unknown, data: unknown) => void,
    ) => void;
  };
  ipcMain?: {
    on: (
      channel: string,
      listener: (event: unknown, data: unknown) => void,
    ) => void;
    off?: (
      channel: string,
      listener: (event: unknown, data: unknown) => void,
    ) => void;
  };
  webContents?: {
    getAllWebContents: () => Array<{
      id: number;
      send: (channel: string, data: unknown) => void;
    }>;
  };
};
