import { EventEmitter } from "events";
import type { EventRegistry } from "./registry";
import type { EventManager } from "./types";

function createDesktopManager<T extends Record<string, unknown>>(
  emitter: EventEmitter,
): EventManager<T> {
  return {
    on(event, handler) {
      emitter.on(event as string, handler as (data: unknown) => void);
      return () =>
        emitter.off(event as string, handler as (data: unknown) => void);
    },
    once(event, handler) {
      emitter.once(event as string, handler as (data: unknown) => void);
      return () =>
        emitter.off(event as string, handler as (data: unknown) => void);
    },
    emit(event, ...args) {
      emitter.emit(event as string, ...args);
    },
    off(event, handler) {
      emitter.off(event as string, handler as (data: unknown) => void);
    },
    removeAllListeners() {
      emitter.removeAllListeners();
    },
    listenerCount(event) {
      return emitter.listenerCount(event as string);
    },
  };
}

export function Events<
  T extends Record<string, unknown> = EventRegistry,
>(): EventManager<T> {
  const emitter = new EventEmitter();
  emitter.setMaxListeners(100);
  return createDesktopManager<T>(emitter);
}

export const events = Events();
