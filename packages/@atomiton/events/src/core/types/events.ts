export type EventHandler<T = unknown> = (data: T) => void;

export type EventListener = (...args: unknown[]) => void;

export type EventContext = {
  emit(eventName: string, data: unknown): void;
  on(eventName: string, listener: EventListener): void;
  once(eventName: string, listener: EventListener): void;
  off(eventName: string, listener: EventListener): void;
  removeAllListeners(): void;
  listenerCount(eventName: string): number;
  listenerMap: WeakMap<EventHandler, EventListener>;
  domain: string;
  forwardedEvents?: Set<string>;
};

export type EmitterLike = {
  emit(eventName: string, ...args: unknown[]): boolean | void;
  on(eventName: string, listener: EventListener): unknown;
  once(eventName: string, listener: EventListener): unknown;
  off(eventName: string, listener: EventListener): unknown;
  removeAllListeners(eventName?: string): unknown;
  listenerCount(eventName: string): number;
};
