import { createBrowserIPCBridge } from "#browser/bridge";
import type { EventBus, EventMap } from "#core/types";
import { createBaseEventBus } from "#shared/createBaseEventBus";
import { createEventContext } from "#shared/eventContext";
import { createBrowserLogger } from "@atomiton/logger/browser";
import { EventEmitter as EventEmitter3 } from "eventemitter3";

export type IPCConfig = {
  targetOrigin?: string;
  allowedOrigins?: string[];
};

export type BrowserEventBusOptions = {
  domain?: string;
  enableBridge?: boolean;
  enableMiddleware?: boolean;
  ipcConfig?: IPCConfig;
};

const logger = createBrowserLogger({ namespace: "events:browser" });

export function createBrowserEventBus<T extends EventMap = EventMap>(
  options?: BrowserEventBusOptions,
): EventBus<T> {
  const {
    domain = "global",
    enableBridge = false,
    enableMiddleware = false,
    ipcConfig,
  } = options ?? {};

  logger.debug(`Creating browser event bus for domain: ${domain}`, {
    enableBridge,
    enableMiddleware,
  });

  const emitter = new EventEmitter3();

  const context = createEventContext(domain, emitter);

  const bus = createBaseEventBus<T>({
    domain,
    context,
    enableBridge,
    enableMiddleware,
  });

  if (enableBridge && bus.bridge) {
    const ipcBridge = createBrowserIPCBridge(ipcConfig);
    const originalForward = bus.bridge.forward;
    bus.bridge.forward = (event, target) => {
      originalForward(event, target);
      if (target === "desktop") {
        logger.debug(`Forwarding event to desktop`, {
          domain,
          event: String(event),
          target,
        });
        ipcBridge.send(`${domain}:${String(event)}`, null);
      }
    };
    logger.info(`Browser event bus bridge enabled for domain: ${domain}`);
  }

  return bus;
}
