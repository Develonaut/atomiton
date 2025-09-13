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

import { nodes } from "@atomiton/nodes";

import nodesPackage from "@atomiton/nodes/package.json";
import corePackage from "../package.json";

class CoreAPI {
  private static instance: CoreAPI;

  private constructor() {}

  static getInstance(): CoreAPI {
    if (!CoreAPI.instance) {
      CoreAPI.instance = new CoreAPI();
    }
    return CoreAPI.instance;
  }

  get nodes() {
    return nodes;
  }

  get version() {
    return {
      core: corePackage.version,
      nodes: nodesPackage.version,
    };
  }

  async initialize(): Promise<void> {
    // Initialize nodes subsystem
    // Note: Infrastructure packages (store, events) should be initialized
    // directly by the packages that use them to avoid circular dependencies
    await nodes.initialize();
  }
}

const core = CoreAPI.getInstance();

export default core;
export { core };
export type { CoreAPI };
