/**
 * Store API - Centralized API for the Store Package
 *
 * Provides a unified interface to all store functionality,
 * following the same pattern as @atomiton/nodes but using api.ts naming.
 *
 * Usage:
 *   import store from '@atomiton/store';
 *
 *   // Create a new store
 *   const myStore = store.createStore({
 *     initialState: { count: 0 }
 *   });
 *
 *   // Initialize application stores
 *   await store.initialize();
 *
 *   // Access application stores
 *   const blueprintStore = store.getStores().blueprint;
 */

import type { Store, StoreConfig } from "./base";
import {
  createStore as baseCreateStore,
  combineStores,
  createAction,
  createActions,
  createSelector,
  createSelectors,
} from "./base";
import { shallow } from "zustand/shallow";

// ============================================================================
// Types
// ============================================================================

export interface StoreSubscription {
  unsubscribe: () => void;
}

class StoreAPI {
  private static instance: StoreAPI;
  private initialized = false;
  private registeredStores = new Map<string, Store<unknown>>();

  private constructor() {}

  static getInstance(): StoreAPI {
    if (!StoreAPI.instance) {
      StoreAPI.instance = new StoreAPI();
    }
    return StoreAPI.instance;
  }

  /**
   * Initialize the store system
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
  }

  /**
   * Check if stores are initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Cleanup all stores
   */
  cleanup(): void {
    this.initialized = false;
    this.registeredStores.clear();
  }

  /**
   * Create a new store with Immer and optional persistence
   */
  createStore<T extends object>(config: StoreConfig<T>): Store<T> {
    return baseCreateStore(config);
  }

  /**
   * Create a bound action for a store
   */
  createAction<T, Args extends unknown[], R>(
    store: Store<T>,
    action: (state: T, ...args: Args) => R,
  ): (...args: Args) => R {
    return createAction(store, action);
  }

  /**
   * Create multiple bound actions for a store
   */
  createActions<
    T,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Actions extends Record<string, (state: T, ...args: any[]) => any>,
  >(
    store: Store<T>,
    actions: Actions,
  ): {
    [K in keyof Actions]: (
      ...args: Parameters<Actions[K]> extends [T, ...infer R] ? R : never
    ) => ReturnType<Actions[K]> extends T | void
      ? void
      : ReturnType<Actions[K]>;
  } {
    return createActions(store, actions);
  }

  /**
   * Create a selector for a store
   */
  createSelector<T, R>(store: Store<T>, selector: (state: T) => R): () => R {
    return createSelector(store, selector);
  }

  /**
   * Create multiple selectors for a store
   */
  createSelectors<T, Selectors extends Record<string, (state: T) => unknown>>(
    store: Store<T>,
    selectors: Selectors,
  ): { [K in keyof Selectors]: () => ReturnType<Selectors[K]> } {
    return createSelectors(store, selectors);
  }

  /**
   * Combine multiple stores into a single store
   */
  combineStores<Stores extends Record<string, Store<unknown>>>(
    stores: Stores,
  ): Store<{
    [K in keyof Stores]: Stores[K] extends Store<infer T> ? T : never;
  }> {
    return combineStores(stores);
  }

  /**
   * Register a named store for global access
   */
  registerStore<T>(name: string, store: Store<T>): void {
    if (this.registeredStores.has(name)) {
      console.warn(`Store with name ${name} already registered`);
      return;
    }

    this.registeredStores.set(name, store as Store<unknown>);
  }

  /**
   * Get a registered store by name
   */
  getRegisteredStore<T>(name: string): Store<T> | undefined {
    return this.registeredStores.get(name) as Store<T> | undefined;
  }

  /**
   * Unregister a named store
   */
  unregisterStore(name: string): boolean {
    return this.registeredStores.delete(name);
  }

  /**
   * Get all registered store names
   */
  getRegisteredStoreNames(): string[] {
    return Array.from(this.registeredStores.keys());
  }

  /**
   * Clear all registered stores
   */
  clearRegisteredStores(): void {
    this.registeredStores.clear();
  }

  /**
   * Shallow equality function for comparing arrays and objects
   */
  get shallow() {
    return shallow;
  }
}

// Export singleton instance
const store = StoreAPI.getInstance();

export default store;
export { store };
export type { StoreAPI };
