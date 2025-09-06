/**
 * Core - Centralized API for Atomiton internal packages
 *
 * Provides a unified interface to all Atomiton functionality,
 * similar to Firebase or Stripe SDK patterns.
 *
 * Usage:
 *   import { core } from '@atomiton/core';
 *
 *   // Access store functionality
 *   core.store.initialize(...)
 *
 *   // Access event system
 *   core.events.emit(...)
 *
 *   // Access node system
 *   core.nodes.registerPackage(...)
 */

import * as Store from "@atomiton/store";
import * as Events from "@atomiton/events";
import * as Nodes from "@atomiton/nodes";

import corePackage from "../package.json";
import storePackage from "@atomiton/store/package.json";
import eventsPackage from "@atomiton/events/package.json";
import nodesPackage from "@atomiton/nodes/package.json";

class CoreAPI {
  private static instance: CoreAPI;

  private constructor() {}

  static getInstance(): CoreAPI {
    if (!CoreAPI.instance) {
      CoreAPI.instance = new CoreAPI();
    }
    return CoreAPI.instance;
  }

  get store() {
    return Store;
  }

  get events() {
    return Events;
  }

  get nodes() {
    return Nodes;
  }

  get version() {
    return {
      core: corePackage.version,
      store: storePackage.version,
      events: eventsPackage.version,
      nodes: nodesPackage.version,
    };
  }

  async initialize(config?: {
    store?: Record<string, unknown>;
    events?: Record<string, unknown>;
    nodes?: Record<string, unknown>;
  }): Promise<void> {
    void config;
  }
}

const core = CoreAPI.getInstance();

export default core;
export { core };
export type { CoreAPI };
