/**
 * @atomiton/store - Simplified State Management
 *
 * Clean, functional API for creating Zustand stores with Immer and persistence
 *
 * Map/Set support is automatically enabled on first store creation.
 */

import { kebabCase } from "@atomiton/utils";
import { enableMapSet } from "immer";
import type { StoreApi, UseBoundStore } from "zustand";
import { create } from "zustand";
import type { PersistOptions, PersistStorage } from "zustand/middleware";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// Track initialization to ensure enableMapSet() is only called once
let initialized = false;

/**
 * Function that creates initial state
 */
export type StateCreator<T> = () => T;

/**
 * Store interface - What consumers actually need
 */
export type Store<T> = {
  getState(): T;
  setState(
    partial: T | Partial<T> | ((state: T) => T | void),
    replace?: boolean,
  ): void;
  subscribe(listener: (state: T, prevState: T) => void): () => void;
};

/**
 * Persistence configuration - Essential options only
 */
export type PersistConfig<T> = {
  key?: string;
  storage?: PersistStorage<T>;
  partialize?: (state: T) => Partial<T>;
  onRehydrateStorage?: (
    state: T,
  ) => ((state?: T | undefined, error?: Error | undefined) => void) | void;
  version?: number;
  migrate?: (persistedState: unknown, version: number) => T | Promise<T>;
  skipHydration?: boolean;
};

/**
 * Store configuration
 */
export type StoreConfig<T> = {
  name?: string;
  persist?: PersistConfig<T>;
};

/**
 * Creates a Zustand store with Immer for immutability and optional persistence
 * Automatically prefixes store names with "atomiton-" and converts to kebab-case
 *
 * On first invocation, automatically enables Map/Set support in Immer.
 */
export function createStore<T extends object>(
  initializer: StateCreator<T>,
  config: StoreConfig<T> = {},
): Store<T> & { useStore: UseBoundStore<StoreApi<T>> } {
  // Lazy initialization: enable Map/Set support on first store creation
  if (!initialized) {
    enableMapSet();
    initialized = true;
  }

  const { name = "Store", persist: persistConfig } = config;

  // Auto-format name: prefix with "atomiton-" and convert to kebab-case
  const formattedName = `atomiton-${kebabCase(name)}`;

  // Create the basic store creator with Immer
  const storeCreator = immer<T>(() => initializer());

  let zustandStore;

  // Non-persisted store
  if (!persistConfig) {
    zustandStore = create<T>()(
      devtools(storeCreator, {
        name: formattedName,
        enabled: process.env.NODE_ENV === "development",
      }),
    );
  } else {
    // Persisted store
    const { key = "persisted", ...restPersistConfig } = persistConfig;

    const persistOptions: PersistOptions<T, T> = {
      name: `store:${key}`,
      ...restPersistConfig,
    } as PersistOptions<T, T>;

    const persistedStore = persist(storeCreator, persistOptions);

    zustandStore = create<T>()(
      devtools(persistedStore, {
        name: `${formattedName}:${key}`,
        enabled: process.env.NODE_ENV === "development",
      }),
    );
  }

  // Create a vanilla store interface that also has the React hook
  const store = {
    getState: zustandStore.getState,
    setState: zustandStore.setState,
    subscribe: zustandStore.subscribe,
    useStore: zustandStore,
  };

  return store as Store<T> & { useStore: UseBoundStore<StoreApi<T>> };
}

export { shallow } from "zustand/shallow";
export type { StoreApi, UseBoundStore } from "zustand";
