export type EventMap = Record<string, unknown>;

// Environment discriminated unions
export type EnvironmentType = "browser" | "desktop";

export type BrowserEnvironment = {
  type: "browser";
  window: Window;
  document: Document;
};

export type DesktopEnvironment = {
  type: "desktop";
  process: NodeJS.Process;
  electronAPI?: unknown;
};

export type Environment = BrowserEnvironment | DesktopEnvironment;

export type EventBus<T extends EventMap = EventMap> = {
  // Existing methods
  emit<K extends keyof T>(event: K, data: T[K]): void;
  on<K extends keyof T>(event: K, handler: (data: T[K]) => void): () => void;
  once<K extends keyof T>(event: K, handler: (data: T[K]) => void): () => void;
  off<K extends keyof T>(event: K, handler: (data: T[K]) => void): void;
  removeAllListeners(): void;
  listenerCount<K extends keyof T>(event: K): number;
  getDomain(): string;

  // New bridge API for cross-environment communication
  bridge?: EventBridge<T>;

  // New middleware support
  middleware?: EventMiddleware;
};

export type EventBridge<T extends EventMap = EventMap> = {
  forward<K extends keyof T>(event: K, target: EnvironmentType): void;
  isForwarded<K extends keyof T>(event: K): boolean;
  stopForwarding<K extends keyof T>(event: K, target?: EnvironmentType): void;
  getForwardingRules(): Map<keyof T, Set<EnvironmentType>>;
};

export type MiddlewareFn<T = unknown> = (event: string, data: T) => T;

export type EventMiddleware = {
  use<T = unknown>(fn: MiddlewareFn<T>): void;
  remove<T = unknown>(fn: MiddlewareFn<T>): void;
  clear(): void;
};

export type EventBusConfig = {
  domain?: string;
  maxListeners?: number;
  enableBridge?: boolean;
  enableMiddleware?: boolean;
};

export type EventManager = {
  createBus<T extends EventMap>(
    domain: string,
    config?: EventBusConfig,
  ): EventBus<T>;
};

import type { IPCBridge } from "#core/types/ipc";

export type DesktopEventManager = {
  createBus<T extends EventMap>(
    domain: string,
    config?: EventBusConfig,
  ): EventBus<T>;
  getIPC(): IPCBridge;
};
