/**
 * StoreService - Public API layer for state management (highest level)
 * Provides domain interactions, React hooks, and orchestration across stores
 */

import { storeClient } from "../clients/StoreClient";
// Import all stores and their types
import { createBlueprintStore } from "../store/blueprintStore";
import type { BlueprintStore, BlueprintState } from "../store/blueprintStore";
import { createExecutionStore } from "../store/executionStore";
import type { ExecutionStore, ExecutionState } from "../store/executionStore";
import type { SessionStore, SessionState } from "../store/sessionStore";
import { createSessionStore } from "../store/sessionStore";
import type { UIStore, UIState, Theme } from "../store/uiStore";
import { createUIStore } from "../store/uiStore";

/**
 * Store subscription interface
 */
export interface StoreSubscription {
  unsubscribe: () => void;
}

/**
 * StoreService - Public API layer for state management (highest level)
 * Orchestrates domain interactions and provides convenience methods
 */
export class StoreService {
  private static instance: StoreService;
  private initialized = false;

  // Store instances
  private uiStore: UIStore | null = null;
  private sessionStore: SessionStore | null = null;
  private blueprintStore: BlueprintStore | null = null;
  private executionStore: ExecutionStore | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): StoreService {
    if (!StoreService.instance) {
      StoreService.instance = new StoreService();
    }
    return StoreService.instance;
  }

  /**
   * Initialize all stores
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Initialize the store client first
    await storeClient.initialize();

    // Create all store instances
    this.uiStore = createUIStore();
    this.sessionStore = createSessionStore();
    this.blueprintStore = createBlueprintStore();
    this.executionStore = createExecutionStore();

    this.initialized = true;
  }

  /**
   * Get UI store
   */
  getUIStore(): UIStore {
    if (!this.uiStore) {
      throw new Error("StoreService not initialized. Call initialize() first.");
    }
    return this.uiStore;
  }

  /**
   * Get session store
   */
  getSessionStore(): SessionStore {
    if (!this.sessionStore) {
      throw new Error("StoreService not initialized. Call initialize() first.");
    }
    return this.sessionStore;
  }

  /**
   * Get blueprint store
   */
  getBlueprintStore(): BlueprintStore {
    if (!this.blueprintStore) {
      throw new Error("StoreService not initialized. Call initialize() first.");
    }
    return this.blueprintStore;
  }

  /**
   * Get execution store
   */
  getExecutionStore(): ExecutionStore {
    if (!this.executionStore) {
      throw new Error("StoreService not initialized. Call initialize() first.");
    }
    return this.executionStore;
  }

  /**
   * Domain method: Set application theme
   */
  setTheme(theme: Theme): void {
    this.getUIStore().actions.setTheme(theme);
  }

  /**
   * Domain method: Show notification
   */
  showNotification(
    type: "info" | "success" | "warning" | "error",
    title: string,
    message?: string,
    duration?: number,
  ): string {
    return this.getUIStore().actions.showNotification({
      type,
      title,
      message,
      duration,
    });
  }

  /**
   * Domain method: Select blueprint
   */
  selectBlueprint(blueprintId: string | null): void {
    this.getBlueprintStore().actions.selectBlueprint(blueprintId);
  }

  /**
   * Domain method: Start job execution
   */
  executeBlueprint(
    blueprintId: string,
    inputs: Record<string, unknown> = {},
  ): string {
    const blueprintState = this.getBlueprintStore().getState();
    const blueprint = blueprintState.blueprints.get(blueprintId);

    if (!blueprint) {
      throw new Error(`Blueprint ${blueprintId} not found`);
    }

    return this.getExecutionStore().actions.addJob({
      blueprintId,
      blueprintName: blueprint.name,
      status: "queued",
      priority: 1,
      progress: { current: 0, total: 100, percentage: 0 },
      inputs,
      outputs: {},
      tags: blueprint.tags,
      nodeStates: new Map(),
    });
  }

  /**
   * Domain method: Get current state snapshot
   */
  getStateSnapshot(): {
    ui: UIState;
    session: SessionState;
    blueprint: BlueprintState;
    execution: ExecutionState;
  } {
    return {
      ui: this.getUIStore().getState(),
      session: this.getSessionStore().getState(),
      blueprint: this.getBlueprintStore().getState(),
      execution: this.getExecutionStore().getState(),
    };
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Cleanup all stores
   */
  async cleanup(): Promise<void> {
    await storeClient.cleanup();

    this.uiStore = null;
    this.sessionStore = null;
    this.blueprintStore = null;
    this.executionStore = null;
    this.initialized = false;
  }
}

// Export singleton instance
export const storeService = StoreService.getInstance();

// Legacy compatibility exports (deprecated)
export type StateUpdater<T> = (state: T) => T;
export interface Store<T extends object> {
  state: T;
  setState: (updater: StateUpdater<T>) => void;
  subscribe: (callback: () => void) => () => void;
}
