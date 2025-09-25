import type { EventBus, EventMap, IPCBridge } from "#core/types";
import { createDesktopIPCHandler } from "#desktop/bridge";
import { setupAutoForwarding } from "#desktop/bridge/setupAutoForwarding";
import { createBaseEventBus } from "#shared/createBaseEventBus";
import { createEventContext } from "#shared/eventContext";
import { createDesktopLogger } from "@atomiton/logger/desktop";
import { EventEmitter } from "node:events";

export type AutoForwardConfig = {
  toBrowser?: string[];
  fromBrowser?: string[];
};

export type DesktopEventBusOptions = {
  domain?: string;
  maxListeners?: number;
  enableBridge?: boolean;
  enableMiddleware?: boolean;
  autoForward?: AutoForwardConfig;
};

const logger = createDesktopLogger({ namespace: "events:desktop" });

export function createDesktopEventBus<T extends EventMap = EventMap>(
  options?: DesktopEventBusOptions,
): EventBus<T> & { ipc: IPCBridge } {
  const {
    domain = "global",
    maxListeners = 100,
    enableBridge = true,
    enableMiddleware = false,
    autoForward,
  } = options ?? {};

  logger.debug(`Creating desktop event bus for domain: ${domain}`, {
    enableBridge,
    enableMiddleware,
    autoForward,
  });

  const emitter = new EventEmitter();
  emitter.setMaxListeners(maxListeners);

  const context = createEventContext(domain, emitter);

  const bus = createBaseEventBus<T>({
    domain,
    context,
    enableBridge,
    enableMiddleware,
  });

  // Add IPC support
  const ipc = createDesktopIPCHandler();
  logger.info(`Desktop event bus IPC handler created for domain: ${domain}`);

  if (autoForward && bus.bridge) {
    logger.debug(`Setting up auto-forwarding`, autoForward);
    setupAutoForwarding(bus, ipc, autoForward);
  }

  return Object.assign(bus, { ipc });
}

export type LocalEventBusOptions = Omit<
  DesktopEventBusOptions,
  "autoForward" | "enableBridge"
>;

// Local bus without IPC
export function createLocalEventBus<T extends EventMap = EventMap>(
  options?: LocalEventBusOptions,
): EventBus<T> {
  // Same as desktop but without IPC and bridge
  const { ipc, ...eventBus } = createDesktopEventBus<T>({
    ...options,
    enableBridge: false,
  });
  return eventBus;
}
