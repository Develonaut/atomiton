/**
 * Core - Centralized API for Atomiton internal packages
 *
 * Provides a unified interface to high-level Atomiton functionality.
 * Infrastructure packages (store, events) should be imported directly
 * to avoid circular dependencies.
 *
 * Usage:
 *   import { core } from '@atomiton/core';
 *
 *   // Access node system
 *   core.nodes.registerPackage(...)
 *
 *   // Infrastructure packages are imported directly:
 *   import { store } from '@atomiton/store';
 *   import { events } from '@atomiton/events';
 */

import nodes from "@atomiton/nodes";

import nodesPackage from "@atomiton/nodes/package.json";
import corePackage from "../package.json";
class CoreAPI {
  get nodes() {
    return nodes;
  }

  get version() {
    return {
      core: corePackage.version,
      nodes: nodesPackage.version,
    };
  }
}

// Create a default instance for backwards compatibility
const core = new CoreAPI();

export default core;
export type { CoreAPI };
