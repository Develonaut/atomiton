import { EventEmitter as NodeEventEmitter } from "events";
import type { EventBus, EventBusConfig } from "../../types";
import type { EventContext } from "../../shared";
import type { IPCBridge } from "../../types";
import { createEventBusImpl } from "../../shared";
import { createIPCBridge } from "../../ipc";

type DesktopEventBusConfig = EventBusConfig & {
  ipc?: {
    enabled: boolean;
    bridgeMode?: "auto" | "manual";
    forwardEvents?: string[];
  };
};

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

function setupAutoForwarding<T extends Record<string, unknown>>(
  bus: EventBus<T>,
  ipc: IPCBridge,
  domain: string,
  eventsToForward: string[],
): void {
  eventsToForward.forEach((eventType) => {
    const eventName = `${domain}:${String(eventType)}`;
    const originalEmit = bus.emit.bind(bus);
    const busWithEmit = bus as EventBus<T> & {
      emit: <K extends keyof T>(event: K, data: T[K]) => void;
    };

    busWithEmit.emit = function emit<K extends keyof T>(event: K, data: T[K]) {
      originalEmit(event, data);
      ipc.send(eventName, data);
    };
    ipc.on(eventName, (ipcEvent) => {
      const temp = busWithEmit.emit;
      busWithEmit.emit = originalEmit;
      bus.emit(eventType as keyof T, ipcEvent.data as T[keyof T]);
      busWithEmit.emit = temp;
    });
  });
}

export function createEventBus<T extends Record<string, unknown>>(
  domain: string,
  config?: DesktopEventBusConfig,
): EventBus<T> & { ipc?: IPCBridge } {
  const bus = createLocalEventBus<T>(domain, config);
  if (!config?.ipc?.enabled) {
    return bus;
  }

  const ipc = createIPCBridge();

  if (config.ipc.bridgeMode === "auto" && ipc.isAvailable()) {
    const eventsToForward = config.ipc.forwardEvents || Object.keys({} as T);
    setupAutoForwarding(bus, ipc, domain, eventsToForward);
  }

  return Object.assign(bus, { ipc });
}
