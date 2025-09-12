/**
 * @atomiton/events - Main Package Exports
 *
 * Clean API surface - all functionality accessed through events singleton
 */

// Main API export (follows core package pattern with api.ts)
export { events } from "./api";

// Types consumers need
export type { EventsAPI } from "./api";
export type * from "./types";
