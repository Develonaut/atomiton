import type { EventBus, EventMap } from "#core/types";
import { createEventBus } from "#desktop/index";

const eventBus = createEventBus({
  domain: "global",
  useIPC: true,
  enableMiddleware: true,
});

export const events: EventBus<EventMap> & { ipc?: any } = eventBus;

if (typeof window !== "undefined" && (window as any).electronAPI) {
  (events as any).ipc = {
    isAvailable: () => true,
    getEnvironment: () => "renderer" as const,
  };
} else if (typeof process !== "undefined" && process.versions?.electron) {
  (events as any).ipc = {
    isAvailable: () => true,
    getEnvironment: () => "main" as const,
  };
}
