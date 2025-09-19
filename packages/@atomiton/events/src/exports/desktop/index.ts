import type { EventBus } from "../../types";
import createDesktopEventBus from "./createDesktopEventBus";

/**
 * Global event bus singleton for desktop/Node.js environments
 * This is the only export from this module
 */
export const events = createDesktopEventBus("global");

export type { EventBus };
