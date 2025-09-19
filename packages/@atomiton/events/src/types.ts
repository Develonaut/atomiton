import type { EventRegistry } from "./registry";

export type EventHandler<T = unknown> = (data: T) => void;
export type EventSubscription = () => void;

export type EventManager<T extends Record<string, unknown> = EventRegistry> = {
  on<K extends keyof T>(event: K, handler: EventHandler<T[K]>): () => void;
  once<K extends keyof T>(event: K, handler: EventHandler<T[K]>): () => void;
  emit<K extends keyof T>(
    event: K,
    ...args: T[K] extends void ? [] : [T[K]]
  ): void;
  off<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void;
  removeAllListeners(): void;
  listenerCount<K extends keyof T>(event: K): number;
};

export function Events<
  T extends Record<string, unknown> = EventRegistry,
>(): EventManager<T> {
  throw new Error(
    "Use environment-specific import: @atomiton/events/browser or @atomiton/events/desktop",
  );
}

export type IPCEvent = {
  channel: string;
  data: unknown;
};

export type IPCBridge = {
  send: (channel: string, data: unknown) => void;
  on: (channel: string, handler: (event: IPCEvent) => void) => () => void;
  isAvailable: () => boolean;
  getEnvironment: () => "renderer" | "main" | null;
};
