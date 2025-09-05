/**
 * Store API - Public functional API for state management
 * Provides high-level functions for common operations
 */

import { combineStores } from "./base";
import type { Store } from "./base";

// Import stores
import { createBlueprintStore } from "./stores/blueprint";
import type {
  BlueprintStore,
  BlueprintState,
  Blueprint,
} from "./stores/blueprint";
import { createUIStore } from "./stores/ui";
import type { UIStore, UIState, Theme, Notification } from "./stores/ui";
import { createSessionStore } from "./stores/session";
import type { SessionStore, SessionState } from "./stores/session";
import { createExecutionStore } from "./stores/execution";
import type { ExecutionStore, ExecutionState } from "./stores/execution";

// ============================================================================
// Types
// ============================================================================

export interface StoreSubscription {
  unsubscribe: () => void;
}

export interface AppStores {
  blueprint: BlueprintStore;
  ui: UIStore;
  session: SessionStore;
  execution: ExecutionStore;
}

export interface AppState {
  blueprint: BlueprintState;
  ui: UIState;
  session: SessionState;
  execution: ExecutionState;
}

// ============================================================================
// Private State
// ============================================================================

let stores: AppStores | null = null;
let rootStore: Store<AppState> | null = null;

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize all stores
 */
export function initialize(): AppStores {
  if (stores) return stores;

  // Create individual stores
  stores = {
    blueprint: createBlueprintStore(),
    ui: createUIStore(),
    session: createSessionStore(),
    execution: createExecutionStore(),
  };

  // Create combined root store for convenient access
  rootStore = combineStores(
    stores as unknown as Record<string, Store<unknown>>,
  ) as unknown as Store<AppState>;

  return stores;
}

/**
 * Get all stores (initializes if needed)
 */
export function getStores(): AppStores {
  if (!stores) initialize();
  return stores!;
}

/**
 * Get the root combined store
 */
export function getRootStore(): Store<AppState> {
  if (!rootStore) initialize();
  return rootStore!;
}

/**
 * Check if stores are initialized
 */
export function isInitialized(): boolean {
  return stores !== null;
}

/**
 * Cleanup all stores
 */
export function cleanup(): void {
  stores = null;
  rootStore = null;
}

// ============================================================================
// Store Access Functions
// ============================================================================

/**
 * Get current state snapshot
 */
export function getState(): AppState {
  const { blueprint, ui, session, execution } = getStores();
  return {
    blueprint: blueprint.getState(),
    ui: ui.getState(),
    session: session.getState(),
    execution: execution.getState(),
  };
}

/**
 * Get a specific store's state
 */
export function getStoreState<K extends keyof AppStores>(
  storeName: K,
): AppStores[K] extends Store<infer S> ? S : never {
  return getStores()[storeName].getState() as AppStores[K] extends Store<
    infer S
  >
    ? S
    : never;
}

// ============================================================================
// UI Actions
// ============================================================================

/**
 * Set application theme
 */
export function setTheme(theme: Theme): void {
  getStores().ui.actions.setTheme(theme);
}

/**
 * Show a notification
 */
export function showNotification(
  type: Notification["type"],
  title: string,
  message?: string,
  duration?: number,
): string {
  return getStores().ui.actions.showNotification({
    type,
    title,
    message,
    duration,
  });
}

/**
 * Dismiss a notification
 */
export function dismissNotification(id: string): void {
  getStores().ui.actions.dismissNotification(id);
}

// ============================================================================
// Blueprint Actions
// ============================================================================

/**
 * Select a blueprint
 */
export function selectBlueprint(id: string | null): void {
  getStores().blueprint.actions.selectBlueprint(id);
}

/**
 * Add a new blueprint
 */
export function addBlueprint(blueprint: Blueprint): void {
  getStores().blueprint.actions.addBlueprint(blueprint);
}

/**
 * Get all blueprints
 */
export function getBlueprints(): Blueprint[] {
  return getStores().blueprint.selectors.getAllBlueprints();
}

/**
 * Get filtered blueprints
 */
export function getFilteredBlueprints(): Blueprint[] {
  return getStores().blueprint.selectors.getFilteredBlueprints();
}

// ============================================================================
// Execution Actions
// ============================================================================

/**
 * Execute a blueprint
 */
export function executeBlueprint(
  blueprintId: string,
  inputs: Record<string, unknown> = {},
): string {
  const blueprint =
    getStores().blueprint.selectors.getBlueprintById()(blueprintId);

  if (!blueprint) {
    throw new Error(`Blueprint ${blueprintId} not found`);
  }

  return getStores().execution.actions.addJob({
    blueprintId,
    blueprintName: blueprint.name,
    status: "queued",
    priority: 1,
    progress: { current: 0, total: 100, percentage: 0 },
    inputs,
    outputs: {},
    tags: blueprint.tags,
    nodeStates: new Map(),
    logs: [],
  });
}

// ============================================================================
// Subscriptions
// ============================================================================

/**
 * Subscribe to any state changes
 */
export function subscribe(
  callback: (state: AppState) => void,
): StoreSubscription {
  const unsubscribe = getRootStore().subscribe(callback);
  return { unsubscribe };
}

/**
 * Subscribe to a specific store
 */
export function subscribeToStore<K extends keyof AppStores>(
  storeName: K,
  callback: (state: AppStores[K] extends Store<infer S> ? S : never) => void,
): StoreSubscription {
  const unsubscribe = getStores()[storeName].subscribe((state, _prevState) =>
    callback(state as AppStores[K] extends Store<infer S> ? S : never),
  );
  return { unsubscribe };
}

/**
 * Subscribe to UI state changes
 */
export function subscribeToUI(
  callback: (state: UIState) => void,
): StoreSubscription {
  return subscribeToStore("ui", callback);
}

/**
 * Subscribe to blueprint state changes
 */
export function subscribeToBlueprint(
  callback: (state: BlueprintState) => void,
): StoreSubscription {
  return subscribeToStore("blueprint", callback);
}

/**
 * Subscribe to session state changes
 */
export function subscribeToSession(
  callback: (state: SessionState) => void,
): StoreSubscription {
  return subscribeToStore("session", callback);
}

/**
 * Subscribe to execution state changes
 */
export function subscribeToExecution(
  callback: (state: ExecutionState) => void,
): StoreSubscription {
  return subscribeToStore("execution", callback);
}

// ============================================================================
// State Snapshot (for debugging/testing)
// ============================================================================

/**
 * Get a JSON-serializable snapshot of all state
 */
export function getStateSnapshot(): Record<string, unknown> {
  const state = getState();
  return {
    blueprint: {
      ...state.blueprint,
      blueprints: Array.from(state.blueprint.blueprints.entries()),
    },
    ui: {
      ...state.ui,
      panelStates: Array.from(state.ui.panelStates.entries()),
    },
    session: {
      ...state.session,
      shortcuts: Array.from(state.session.shortcuts.entries()),
      activeKeys: Array.from(state.session.activeKeys),
    },
    execution: {
      ...state.execution,
      jobs: Array.from(state.execution.jobs.entries()),
      activeJobIds: Array.from(state.execution.activeJobIds),
    },
  };
}
