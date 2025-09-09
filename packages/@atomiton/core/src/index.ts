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

import core from "./api";

export { core, type CoreAPI } from "./api";
export type { NodeItem, NodeType } from "@atomiton/nodes";

export default core;
