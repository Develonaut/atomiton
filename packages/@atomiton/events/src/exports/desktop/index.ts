import { Events, events } from "../../events";
import type { EventManager } from "../../events";
import type { EventRegistry } from "../../registry";

// Re-export the desktop version (Node EventEmitter)
export { Events, events };
export type { EventManager, EventRegistry };
