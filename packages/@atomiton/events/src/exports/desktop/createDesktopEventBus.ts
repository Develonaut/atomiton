import { createIPCBridge } from "../../ipc";
import type { EventBus, EventBusConfig, IPCBridge } from "../../types";
import createLocalEventBus from "./createLocalEventBus";
import setupAutoForwarding from "./setupAutoForwading";

type DesktopEventBusConfig = EventBusConfig & {
  ipc?: {
    enabled: boolean;
    bridgeMode?: "auto" | "manual";
    forwardEvents?: string[];
  };
};

function createDesktopEventBus<T extends Record<string, unknown>>(
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

export default createDesktopEventBus;
