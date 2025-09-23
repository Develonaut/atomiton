import type { EventBus, EventMap } from "#core/types";
import type { AutoForwardConfig } from "#desktop/bus";
import { createDesktopEventBus, createLocalEventBus } from "#desktop/bus";

export function createEventBus<T extends EventMap = EventMap>(options?: {
  domain?: string;
  useIPC?: boolean;
  maxListeners?: number;
  enableMiddleware?: boolean;
  autoForward?: AutoForwardConfig;
}): EventBus<T> {
  const { useIPC = true, ...rest } = options ?? {};

  return useIPC ? createDesktopEventBus<T>(rest) : createLocalEventBus<T>(rest);
}

export type { EventBus, EventMap } from "#core/types";
