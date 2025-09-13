/**
 * @atomiton/core - Centralized API for Atomiton Platform
 *
 * Provides a unified interface to high-level Atomiton functionality.
 * Infrastructure packages (store, events) should be imported directly.
 *
 * Usage:
 *   import core from '@atomiton/core';
 *   import { store } from '@atomiton/store';
 *   import { events } from '@atomiton/events';
 *
 *   core.nodes.registerPackage(package);
 *   store.initialize();
 *   events.emit('event', data);
 */

import core from "./api";

export default core;
export type { CoreAPI } from "./api";
export type { NodeType } from "@atomiton/nodes";
