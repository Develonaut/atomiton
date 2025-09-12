/**
 * @atomiton/store - Main Package Exports
 *
 * Clean API surface - all functionality accessed through store singleton
 */

// Main API export (follows core package pattern with api.ts)
export { store } from "./api";

// Types consumers need
export type { StoreAPI } from "./api";
export type { StateUpdater, Store, StoreConfig } from "./base";
