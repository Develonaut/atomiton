/**
 * @atomiton/core - Centralized API for Atomiton Platform
 *
 * Provides a unified interface to all Atomiton functionality through
 * the core singleton.
 *
 * Usage:
 *   import core from '@atomiton/core';
 *
 *   core.store.initialize();
 *   core.events.emit('event', data);
 *   core.nodes.registerPackage(package);
 */

export { default } from "./core";
export { core, type CoreAPI } from "./core";
