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

import { events } from "@atomiton/events";
import { nodes } from "@atomiton/nodes";
import { store } from "@atomiton/store";

import eventsPackage from "@atomiton/events/package.json";
import nodesPackage from "@atomiton/nodes/package.json";
import storePackage from "@atomiton/store/package.json";
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

  get store() {
    return store;
  }

  get events() {
    return events;
  }

  get nodes() {
    return nodes;
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
    // Initialize all subsystems
    await store.initialize();
    await events.initialize();
    await nodes.initialize();

    void config; // TODO: Use config for subsystem initialization if needed
  }
}

const core = CoreAPI.getInstance();

export default core;
export { core };
export type { CoreAPI };
