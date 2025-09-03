/**
 * StoreClient - Core Zustand functionality (lowest level)
 * Provides foundation for creating and configuring Zustand stores
 * Has no dependencies on other stores or high-level services
 */

import { enableMapSet } from "immer";
import { create } from "zustand";
import type { PersistStorage, StorageValue } from "zustand/middleware";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { ClientFactory } from "../clients/ClientFactory";
import type { IStorageClient } from "../clients/storage/IStorageClient";
import { getPlatform } from "../platforms/detector";

/**
 * State updater function type
 */
export type StateUpdater<T> = (state: T) => T;

/**
 * Persisted data wrapper
 */
export interface PersistedData {
  [key: string]: unknown;
}

/**
 * Store configuration options
 */
export interface StoreConfig<T> {
  /**
   * Initial state for the store
   */
  initialState: T;

  /**
   * Enable persistence for this store
   */
  persist?: boolean;

  /**
   * Storage key for persistence
   */
  persistKey?: string;

  /**
   * Debounce time for persistence (ms)
   */
  persistDebounce?: number;

  /**
   * Filter function to determine what gets persisted
   */
  persistFilter?: (state: T) => Partial<T>;

  /**
   * Transform function for hydration
   */
  hydrateTransform?: (persisted: PersistedData) => T;
}

/**
 * Core store interface (compatible with Zustand)
 */
export type ZustandStore<T> = {
  getState: () => T;
  setState: (
    updater: StateUpdater<T> | Partial<T>,
    shouldReplace?: boolean,
  ) => void;
  subscribe: (callback: (state: T, prevState: T) => void) => () => void;
};

/**
 * StoreClient - Core Zustand functionality
 */
export class StoreClient {
  private static instance: StoreClient;
  private storageClient: IStorageClient | null = null;
  private initialized = false;

  private constructor() {
    // Enable Map/Set support in Immer
    enableMapSet();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): StoreClient {
    if (!StoreClient.instance) {
      StoreClient.instance = new StoreClient();
    }
    return StoreClient.instance;
  }

  /**
   * Initialize the store client
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const platform = getPlatform();
    this.storageClient = ClientFactory.createStorageClient(platform);
    await this.storageClient.initialize();

    this.initialized = true;
  }

  /**
   * Create a new Zustand store with optional persistence
   */
  createZustandStore<T extends object>(
    config: StoreConfig<T>,
  ): ZustandStore<T> {
    if (config.persist && config.persistKey) {
      // Create persisted store
      return create<T>()(
        persist(
          immer((_set, _get) => {
            return config.initialState;
          }),
          {
            name: `zustand-store-${config.persistKey}`,
            storage: this.createCustomStorage(config) as PersistStorage<T>,
            partialize: config.persistFilter
              ? (state: T): T => config.persistFilter!(state as T) as T
              : undefined,
          },
        ),
      ) as unknown as ZustandStore<T>;
    } else {
      // Create non-persisted store
      return create<T>()(
        immer((_set) => {
          return config.initialState;
        }),
      ) as unknown as ZustandStore<T>;
    }
  }

  /**
   * Create custom storage adapter for Zustand persist middleware
   */
  private createCustomStorage<T extends object>(
    config: StoreConfig<T>,
  ): PersistStorage<T> {
    return {
      getItem: async (_name: string): Promise<StorageValue<T> | null> => {
        if (!this.storageClient) return null;

        try {
          const buffer = await this.storageClient.read(
            `store:${config.persistKey}`,
          );
          if (!buffer) return null;

          const serialized = buffer.toString("utf-8");
          let persisted: PersistedData | T = JSON.parse(
            serialized,
          ) as PersistedData;

          if (config.hydrateTransform) {
            persisted = config.hydrateTransform(persisted as PersistedData);
          }

          return { state: persisted as T, version: 0 };
        } catch (error) {
          console.error(
            `Failed to read persisted state for "${config.persistKey}":`,
            error,
          );
          return null;
        }
      },
      setItem: async (name: string, value: StorageValue<T>): Promise<void> => {
        if (!this.storageClient) return;

        try {
          const buffer = Buffer.from(JSON.stringify(value), "utf-8");
          await this.storageClient.write(`store:${config.persistKey}`, buffer);
        } catch (error) {
          console.error(
            `Failed to persist state for "${config.persistKey}":`,
            error,
          );
        }
      },
      removeItem: async (_name: string): Promise<void> => {
        // Implement if needed for cleanup
      },
    };
  }

  /**
   * Persist a store's current state
   */
  async persistStoreState<T extends object>(
    store: ZustandStore<T>,
    config: StoreConfig<T>,
  ): Promise<void> {
    if (!this.storageClient || !config.persistKey || !config.persist) {
      return;
    }

    try {
      const state = store.getState();
      let stateToPersist: T | Partial<T> = state;

      if (config.persistFilter) {
        stateToPersist = config.persistFilter(state as T);
      }

      const serialized = JSON.stringify(stateToPersist);
      const buffer = Buffer.from(serialized, "utf-8");
      await this.storageClient.write(`store:${config.persistKey}`, buffer);
    } catch (error) {
      console.error(`Failed to persist store "${config.persistKey}":`, error);
    }
  }

  /**
   * Check if store client is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get storage client (for advanced use cases)
   */
  getStorageClient(): IStorageClient | null {
    return this.storageClient;
  }

  /**
   * Cleanup and shutdown
   */
  async cleanup(): Promise<void> {
    if (this.storageClient) {
      await this.storageClient.cleanup();
      this.storageClient = null;
    }
    this.initialized = false;
  }
}

// Export singleton instance
export const storeClient = StoreClient.getInstance();
