import type { EventHandler, EventListener } from "#core/types";

export type EventContext = {
  emit(eventName: string, data: unknown): void;
  on(eventName: string, listener: EventListener): void;
  once(eventName: string, listener: EventListener): void;
  off(eventName: string, listener: EventListener): void;
  removeAllListeners(): void;
  listenerCount(eventName: string): number;
  listenerMap: WeakMap<EventHandler, EventListener>;
  domain: string;
};

export function createEventContext(
  domain: string,
  emitter: {
    emit(event: string, data: unknown): boolean | void;
    on(event: string, listener: EventListener): unknown;
    once(event: string, listener: EventListener): unknown;
    off(event: string, listener: EventListener): unknown;
    removeAllListeners(event?: string): unknown;
    listenerCount(event: string): number;
  },
): EventContext {
  return {
    emit: (eventName: string, data: unknown) => {
      emitter.emit(eventName, data);
    },
    on: (eventName: string, listener: EventListener) => {
      emitter.on(eventName, listener);
    },
    once: (eventName: string, listener: EventListener) => {
      emitter.once(eventName, listener);
    },
    off: (eventName: string, listener: EventListener) => {
      emitter.off(eventName, listener);
    },
    removeAllListeners: () => emitter.removeAllListeners(),
    listenerCount: (eventName: string) => emitter.listenerCount(eventName),
    listenerMap: new WeakMap(),
    domain,
  };
}
