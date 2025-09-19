import { EventEmitter as NodeEventEmitter } from "events";
import type { EventContext } from "../../shared";
import { createEventBusImpl } from "../../shared";
import type { EventBus, EventBusConfig } from "../../types";

function createLocalEventBus<T extends Record<string, unknown>>(
  domain: string,
  config?: EventBusConfig,
): EventBus<T> {
  const emitter = new NodeEventEmitter();
  const maxListeners = config?.maxListeners ?? 100;
  emitter.setMaxListeners(maxListeners);

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

export default createLocalEventBus;
