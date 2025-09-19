import { EventEmitter } from "events";
import { EventEmitter as EventEmitter3 } from "eventemitter3";
import type { EventRegistry } from "./registry";

export type EventHandler<T = any> = (data: T) => void;

export type EventManager<T extends Record<string, any> = EventRegistry> = {
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

/**
 * Creates an event manager with full type safety
 *
 * @example
 * // Use default registry (all events)
 * const events = Events();
 * events.on('ui:node:selected', ({ nodeId }) => console.log(nodeId));
 *
 * // Use custom events
 * type MyEvents = { 'custom': { value: number } };
 * const myEvents = Events<MyEvents>();
 */
export function Events<
  T extends Record<string, any> = EventRegistry,
>(options?: { browser?: boolean }): EventManager<T> {
  // Use EventEmitter3 in browser, Node EventEmitter otherwise
  const isBrowser =
    options?.browser ??
    (typeof window !== "undefined" && !(window as any).electron);

  if (isBrowser) {
    const emitter = new EventEmitter3();

    return {
      on(event, handler) {
        emitter.on(event as string, handler as any);
        return () => emitter.off(event as string, handler as any);
      },

      once(event, handler) {
        emitter.once(event as string, handler as any);
        return () => emitter.off(event as string, handler as any);
      },

      emit(event, ...args) {
        emitter.emit(event as string, ...args);
      },

      off(event, handler) {
        emitter.off(event as string, handler as any);
      },

      removeAllListeners() {
        emitter.removeAllListeners();
      },

      listenerCount(event) {
        return emitter.listenerCount(event as string);
      },
    };
  } else {
    const emitter = new EventEmitter();
    emitter.setMaxListeners(100);

    return {
      on(event, handler) {
        emitter.on(event as string, handler as any);
        return () => emitter.off(event as string, handler as any);
      },

      once(event, handler) {
        emitter.once(event as string, handler as any);
        return () => emitter.off(event as string, handler as any);
      },

      emit(event, ...args) {
        emitter.emit(event as string, ...args);
      },

      off(event, handler) {
        emitter.off(event as string, handler as any);
      },

      removeAllListeners() {
        emitter.removeAllListeners();
      },

      listenerCount(event) {
        return emitter.listenerCount(event as string);
      },
    };
  }
}

// Default singleton instance with all events
export const events = Events();
