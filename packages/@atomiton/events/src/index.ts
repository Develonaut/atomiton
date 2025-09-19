export { createEventBus } from "./exports/desktop";
export type { EventBus, EventBusConfig } from "./types";

// Backward compatibility - provide a default event bus instance
import { createEventBus } from "./exports/desktop";

const defaultBus = createEventBus<Record<string, any>>("default");

export const events = {
  emit: defaultBus.emit.bind(defaultBus),
  on: defaultBus.on.bind(defaultBus),
  once: defaultBus.once.bind(defaultBus),
  off: defaultBus.off.bind(defaultBus),
  removeAllListeners: defaultBus.removeAllListeners.bind(defaultBus),
  listenerCount: defaultBus.listenerCount.bind(defaultBus),
  createEventBus,
};
