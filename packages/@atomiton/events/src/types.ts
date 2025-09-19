export type EventBusConfig = {
  maxListeners?: number;
};
export type EventBus<T extends Record<string, unknown>> = {
  emit<K extends keyof T>(event: K, data: T[K]): void;
  on<K extends keyof T>(event: K, handler: (data: T[K]) => void): () => void;
  once<K extends keyof T>(event: K, handler: (data: T[K]) => void): () => void;
  off<K extends keyof T>(event: K, handler: (data: T[K]) => void): void;
  removeAllListeners(): void;
  listenerCount<K extends keyof T>(event: K): number;
  getDomain(): string;
};
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
export type EventManager = {
  createBus<T extends Record<string, unknown>>(
    domain: string,
    config?: EventBusConfig,
  ): EventBus<T>;
};
export type DesktopEventManager = {
  createBus<T extends Record<string, unknown>>(
    domain: string,
    config?: EventBusConfig,
  ): EventBus<T>;
  getIPC(): IPCBridge;
};
