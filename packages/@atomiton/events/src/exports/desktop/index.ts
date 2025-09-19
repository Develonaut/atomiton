import type { EventBus } from "../../types";
import createDesktopEventBus from "./createDesktopEventBus";

/**
 * Global event bus singleton for desktop/Node.js environments
 * Automatically enables IPC for cross-process communication in Electron apps
 */
export const events = createDesktopEventBus("global");

export type { EventBus };
