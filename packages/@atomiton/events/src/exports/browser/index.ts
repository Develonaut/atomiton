import { EventEmitter as EventEmitter3 } from "eventemitter3";
import type { EventBus, EventBusConfig } from "../../types";
import type { EventContext } from "../../shared";
import { createEventBusImpl } from "../../shared";

export function createEventBus<T extends Record<string, unknown>>(
  domain: string,
  _config?: EventBusConfig,
): EventBus<T> {
  const emitter = new EventEmitter3();

  const ctx: EventContext = {
    emit: (eventName: string, data: unknown) => emitter.emit(eventName, data),
    on: (eventName: string, listener: (...args: unknown[]) => void) => {
      emitter.on(eventName, listener);
    },
    once: (eventName: string, listener: (...args: unknown[]) => void) => {
      emitter.once(eventName, listener);
    },
    off: (eventName: string, listener: (...args: unknown[]) => void) => {
      emitter.off(eventName, listener);
    },
    removeAllListeners: () => emitter.removeAllListeners(),
    listenerCount: (eventName: string) => emitter.listenerCount(eventName),
    listenerMap: new WeakMap(),
    domain,
  };

  return createEventBusImpl<T>(ctx);
}
