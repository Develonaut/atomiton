import { Events, events } from "../../events";
import type { EventManager } from "../../events";
import type { EventRegistry } from "../../registry";

// Re-export the browser-specific version
export { Events, events };
export type { EventManager, EventRegistry };
