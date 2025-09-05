/**
 * Base store functionality - Low-level Zustand store creation
 * Pure functional API for creating stores with Immer and persistence
 */

import { enableMapSet } from "immer";
import { create } from "zustand";
import type { PersistStorage } from "zustand/middleware";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// Enable Map/Set support in Immer on module load
enableMapSet();

// ============================================================================
// Types
// ============================================================================

/**
 * State updater function - Pure function that returns new state
 */
export type StateUpdater<T> = (state: T) => T | void;

/**
 * Store interface - Minimal API surface
 */
export interface Store<T> {
  getState: () => T;
  setState: (updater: StateUpdater<T> | Partial<T>) => void;
  subscribe: (callback: (state: T, prevState: T) => void) => () => void;
}

/**
 * Store configuration
 */
export interface StoreConfig<T> {
  initialState: T;
  persist?: {
    key: string;
    storage?: PersistStorage<T>;
    partialize?: (state: T) => Partial<T>;
    hydrate?: (persisted: unknown) => T;
  };
}

// ============================================================================
// Store Creation
// ============================================================================

/**
 * Creates a Zustand store with Immer for immutability
 */
export function createStore<T extends object>(
  config: StoreConfig<T>,
): Store<T> {
  // Non-persisted store
  if (!config.persist) {
    return create<T>()(immer(() => config.initialState)) as Store<T>;
  }

  // Persisted store
  const { key, storage, partialize, hydrate } = config.persist;

  return create<T>()(
    persist(
      immer(() => config.initialState),
      {
        name: `store:${key}`,
        storage,
        partialize: partialize as ((state: T) => T) | undefined,
        onRehydrateStorage: hydrate
          ? () => (state) => {
              if (state) {
                const hydrated = hydrate(state);
                Object.assign(state, hydrated);
              }
            }
          : undefined,
      },
    ),
  ) as Store<T>;
}

// ============================================================================
// Store Utilities
// ============================================================================

/**
 * Creates a selector hook for a store
 */
export function createSelector<T, R>(
  store: Store<T>,
  selector: (state: T) => R,
): () => R {
  return () => selector(store.getState());
}

/**
 * Creates a bound action for a store
 */
export function createAction<T, Args extends unknown[], R>(
  store: Store<T>,
  action: (state: T, ...args: Args) => R,
): (...args: Args) => R {
  return (...args: Args) => {
    let result!: R;
    store.setState((state) => {
      result = action(state, ...args);
      // If result is the state (when R extends T), return it for state update
      if ((result as unknown) === state) {
        return result as unknown as T;
      }
      // Otherwise return undefined to avoid state change
      return undefined;
    });
    return result;
  };
}

/**
 * Creates multiple bound actions for a store
 */
export function createActions<
  T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Actions extends Record<string, (state: T, ...args: any[]) => any>,
>(
  store: Store<T>,
  actions: Actions,
): {
  [K in keyof Actions]: (
    ...args: Parameters<Actions[K]> extends [T, ...infer R] ? R : never
  ) => ReturnType<Actions[K]> extends T | void ? void : ReturnType<Actions[K]>;
} {
  const boundActions = {} as {
    [K in keyof Actions]: (
      ...args: Parameters<Actions[K]> extends [T, ...infer R] ? R : never
    ) => ReturnType<Actions[K]> extends T | void
      ? void
      : ReturnType<Actions[K]>;
  };

  for (const [name, action] of Object.entries(actions)) {
    (boundActions as Record<string, unknown>)[name] = createAction(
      store,
      action,
    );
  }

  return boundActions;
}

/**
 * Creates multiple selectors for a store
 */
export function createSelectors<
  T,
  Selectors extends Record<string, (state: T) => unknown>,
>(
  store: Store<T>,
  selectors: Selectors,
): { [K in keyof Selectors]: () => ReturnType<Selectors[K]> } {
  const boundSelectors = {} as {
    [K in keyof Selectors]: () => ReturnType<Selectors[K]>;
  };

  for (const [name, selector] of Object.entries(selectors)) {
    (boundSelectors as Record<string, unknown>)[name] = createSelector(
      store,
      selector,
    );
  }

  return boundSelectors;
}

// ============================================================================
// Composition Utilities
// ============================================================================

/**
 * Combines multiple stores into a single store
 */
export function combineStores<Stores extends Record<string, Store<unknown>>>(
  stores: Stores,
): Store<{
  [K in keyof Stores]: Stores[K] extends Store<infer T> ? T : never;
}> {
  type CombinedState = {
    [K in keyof Stores]: Stores[K] extends Store<infer T> ? T : never;
  };

  const getCombinedState = (): CombinedState => {
    const state = {} as CombinedState;
    for (const [key, store] of Object.entries(stores)) {
      (state as Record<string, unknown>)[key] = store.getState();
    }
    return state;
  };

  return {
    getState: getCombinedState,
    setState: (updater) => {
      if (typeof updater === "function") {
        const currentState = getCombinedState();
        const newState = updater(currentState);
        if (newState && typeof newState === "object") {
          for (const [key, value] of Object.entries(newState)) {
            if (key in stores) {
              stores[key]?.setState(value);
            }
          }
        }
      } else {
        for (const [key, value] of Object.entries(updater)) {
          if (key in stores) {
            stores[key]?.setState(value);
          }
        }
      }
    },
    subscribe: (callback) => {
      const unsubscribes = Object.values(stores).map((store) =>
        store.subscribe(() => callback(getCombinedState(), getCombinedState())),
      );
      return () => unsubscribes.forEach((unsub) => unsub());
    },
  };
}
