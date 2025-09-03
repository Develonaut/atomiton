/**
 * StoreClient Tests
 * Foundation layer testing - Core Zustand functionality and persistence
 * Following Brian's testing strategy with focus on pure functions and dependency injection
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { StoreClient } from "../../clients/StoreClient";
import type { StoreConfig } from "../../clients/StoreClient";
import type { MockStorageClient } from "../helpers/store-test-utils";
import { StoreTestFactory } from "../helpers/store-test-utils";

describe("StoreClient", () => {
  let storeFactory: StoreTestFactory;
  let mockStorage: MockStorageClient;

  beforeEach(async () => {
    storeFactory = new StoreTestFactory();
    mockStorage = storeFactory.getMockStorage();
    await storeFactory.initializeStoreClient();
  });

  afterEach(async () => {
    await storeFactory.cleanup();
  });

  describe("Store Creation", () => {
    interface TestState {
      count: number;
      items: string[];
      metadata: Record<string, unknown>;
    }

    const initialState: TestState = {
      count: 0,
      items: [],
      metadata: {},
    };

    it("should create a basic non-persisted store", () => {
      const store = storeFactory.createTestStore(initialState);

      expect(store.getState()).toEqual(initialState);
      expect(typeof store.setState).toBe("function");
      expect(typeof store.subscribe).toBe("function");
    });

    it("should create store with custom initial state", () => {
      const customState: TestState = {
        count: 42,
        items: ["test1", "test2"],
        metadata: { initialized: true },
      };

      const store = storeFactory.createTestStore(customState);

      expect(store.getState()).toEqual(customState);
    });

    it("should handle state updates correctly", () => {
      const store = storeFactory.createTestStore(initialState);

      // Test partial update
      store.setState((state) => ({
        ...state,
        count: state.count + 1,
      }));

      expect(store.getState().count).toBe(1);
      expect(store.getState().items).toEqual([]);

      // Test complex update
      store.setState((state) => ({
        ...state,
        items: [...state.items, "new-item"],
        metadata: { ...state.metadata, lastUpdated: new Date().toISOString() },
      }));

      const finalState = store.getState();
      expect(finalState.count).toBe(1);
      expect(finalState.items).toEqual(["new-item"]);
      expect(finalState.metadata.lastUpdated).toBeDefined();
    });

    it("should support immutable updates with Map and Set", () => {
      interface MapSetState {
        itemMap: Map<string, number>;
        itemSet: Set<string>;
      }

      const initialMapSetState: MapSetState = {
        itemMap: new Map(),
        itemSet: new Set(),
      };

      const store = storeFactory.createTestStore(initialMapSetState);

      store.setState((state) => ({
        ...state,
        itemMap: new Map(state.itemMap).set("key1", 100),
        itemSet: new Set(state.itemSet).add("value1"),
      }));

      const newState = store.getState();
      expect(newState.itemMap.get("key1")).toBe(100);
      expect(newState.itemSet.has("value1")).toBe(true);
    });

    it("should support subscription notifications", () => {
      const store = storeFactory.createTestStore(initialState);
      const mockCallback = vi.fn();

      const unsubscribe = store.subscribe(mockCallback);

      store.setState((state) => ({ ...state, count: 1 }));
      expect(mockCallback).toHaveBeenCalledTimes(1);

      store.setState((state) => ({ ...state, count: 2 }));
      expect(mockCallback).toHaveBeenCalledTimes(2);

      unsubscribe();
      store.setState((state) => ({ ...state, count: 3 }));
      expect(mockCallback).toHaveBeenCalledTimes(2); // Should not increase
    });
  });

  describe("Store Persistence", () => {
    interface PersistentState {
      persistedValue: number;
      temporaryValue: number;
      items: string[];
    }

    const initialPersistentState: PersistentState = {
      persistedValue: 0,
      temporaryValue: 0,
      items: [],
    };

    it("should persist store state to storage", async () => {
      const persistKey = "test-persistence";
      const store = storeFactory.createPersistedTestStore(
        initialPersistentState,
        persistKey,
      );

      // Make changes to the state
      store.setState((state) => ({
        ...state,
        persistedValue: 42,
        items: ["item1", "item2"],
      }));

      // Wait for persistence (async)
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Verify data was written to storage
      const storedData = await mockStorage.read(`store:${persistKey}`);
      expect(storedData).not.toBeNull();

      const parsedData = JSON.parse(storedData!.toString("utf-8"));
      expect(parsedData.state).toMatchObject({
        persistedValue: 42,
        items: ["item1", "item2"],
      });
    });

    it("should restore state from storage on store creation", async () => {
      const persistKey = "test-restore";

      // First store: set some data
      const store1 = storeFactory.createPersistedTestStore(
        initialPersistentState,
        persistKey,
      );

      store1.setState((state) => ({
        ...state,
        persistedValue: 100,
        items: ["restored1", "restored2"],
      }));

      // Wait for persistence
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Second store: should restore data
      const store2 = storeFactory.createPersistedTestStore(
        initialPersistentState,
        persistKey,
      );

      const restoredState = store2.getState();
      expect(restoredState.persistedValue).toBe(100);
      expect(restoredState.items).toEqual(["restored1", "restored2"]);
    });

    it("should handle persist filter correctly", async () => {
      const persistKey = "test-filter";

      const store = storeFactory.createPersistedTestStore(
        initialPersistentState,
        persistKey,
        {
          // Only persist specific fields
          persistFilter: (state) => ({
            persistedValue: state.persistedValue,
            items: state.items,
            // Exclude temporaryValue
          }),
        },
      );

      store.setState((state) => ({
        ...state,
        persistedValue: 50,
        temporaryValue: 999, // This should not be persisted
        items: ["filtered"],
      }));

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Check persisted data
      const storedData = await mockStorage.read(`store:${persistKey}`);
      const parsedData = JSON.parse(storedData!.toString("utf-8"));

      expect(parsedData.state).toHaveProperty("persistedValue", 50);
      expect(parsedData.state).toHaveProperty("items", ["filtered"]);
      expect(parsedData.state).not.toHaveProperty("temporaryValue");
    });

    it("should handle hydration transform correctly", async () => {
      interface ComplexState {
        map: Map<string, number>;
        date: Date;
        regular: string;
      }

      const complexInitial: ComplexState = {
        map: new Map(),
        date: new Date("2024-01-01"),
        regular: "test",
      };

      const persistKey = "test-transform";

      const store1 = storeFactory.createPersistedTestStore(
        complexInitial,
        persistKey,
        {
          hydrateTransform: (persisted: any) => ({
            map: new Map(persisted.map || []),
            date: persisted.date ? new Date(persisted.date) : new Date(),
            regular: persisted.regular || "default",
          }),
        },
      );

      // Set complex data
      const testDate = new Date("2024-12-01");
      store1.setState((state) => ({
        ...state,
        map: new Map([
          ["key1", 123],
          ["key2", 456],
        ]),
        date: testDate,
        regular: "updated",
      }));

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Create new store to test hydration
      const store2 = storeFactory.createPersistedTestStore(
        complexInitial,
        persistKey,
        {
          hydrateTransform: (persisted: any) => ({
            map: new Map(persisted.map || []),
            date: persisted.date ? new Date(persisted.date) : new Date(),
            regular: persisted.regular || "default",
          }),
        },
      );

      const hydratedState = store2.getState();
      expect(hydratedState.map.get("key1")).toBe(123);
      expect(hydratedState.map.get("key2")).toBe(456);
      expect(hydratedState.date.getTime()).toBe(testDate.getTime());
      expect(hydratedState.regular).toBe("updated");
    });
  });

  describe("Error Handling", () => {
    it("should handle storage initialization failure", async () => {
      // Create a new factory with failing storage
      const failingFactory = new StoreTestFactory();
      const failingStorage = failingFactory.getMockStorage();
      failingStorage.simulateFailure(true);

      // Should not throw, but should not initialize
      await expect(failingFactory.initializeStoreClient()).rejects.toThrow();
    });

    it("should handle persistence read errors gracefully", async () => {
      const persistKey = "test-read-error";

      // Create store with failing storage for reads
      mockStorage.simulateFailure(true);

      // Should create store with initial state (not crash)
      const store = storeFactory.createPersistedTestStore(
        { value: 0 },
        persistKey,
      );

      expect(store.getState()).toEqual({ value: 0 });
    });

    it("should handle persistence write errors gracefully", async () => {
      const persistKey = "test-write-error";
      const store = storeFactory.createPersistedTestStore(
        { value: 0 },
        persistKey,
      );

      // Make storage fail after creation
      mockStorage.simulateFailure(true);

      // Should not crash when trying to persist
      expect(() => {
        store.setState({ value: 42 });
      }).not.toThrow();
    });

    it("should handle malformed persisted data", async () => {
      const persistKey = "test-malformed";

      // Pre-populate storage with malformed data
      await mockStorage.write(
        `store:${persistKey}`,
        Buffer.from("invalid json data", "utf-8"),
      );

      // Should create store with initial state
      const store = storeFactory.createPersistedTestStore(
        { value: 100 },
        persistKey,
      );

      expect(store.getState()).toEqual({ value: 100 });
    });
  });

  describe("Store Configuration Validation", () => {
    it("should require initial state", () => {
      expect(() => {
        storeFactory.createTestStore(undefined as any);
      }).toThrow();
    });

    it("should handle missing persist key for persistent stores", () => {
      const config: StoreConfig<{ value: number }> = {
        initialState: { value: 0 },
        persist: true,
        // Missing persistKey
      };

      // Should create non-persistent store when persistKey is missing
      expect(() => {
        storeFactory.createTestStore({ value: 0 }, config);
      }).not.toThrow();
    });

    it("should apply default configuration values", () => {
      const store = storeFactory.createTestStore(
        { value: 0 },
        {
          persist: false,
          persistDebounce: undefined,
        },
      );

      expect(store.getState()).toEqual({ value: 0 });
    });
  });

  describe("Memory Management", () => {
    it("should properly cleanup subscriptions", () => {
      const store = storeFactory.createTestStore({ value: 0 });
      const callbacks: Array<() => void> = [];

      // Create multiple subscriptions
      for (let i = 0; i < 10; i++) {
        const unsubscribe = store.subscribe(() => {});
        callbacks.push(unsubscribe);
      }

      // Unsubscribe all
      callbacks.forEach((unsubscribe) => unsubscribe());

      // Should not leak memory or cause issues
      store.setState({ value: 1 });
      expect(store.getState().value).toBe(1);
    });

    it("should handle rapid state updates efficiently", () => {
      const store = storeFactory.createTestStore({ counter: 0 });
      const startTime = Date.now();

      // Perform many rapid updates
      for (let i = 0; i < 1000; i++) {
        store.setState((state) => ({ counter: state.counter + 1 }));
      }

      const endTime = Date.now();
      expect(store.getState().counter).toBe(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });
  });

  describe("Store Client Singleton", () => {
    it("should maintain singleton pattern", () => {
      const client1 = StoreClient.getInstance();
      const client2 = StoreClient.getInstance();

      expect(client1).toBe(client2);
    });

    it("should track initialization state correctly", () => {
      const client = StoreClient.getInstance();

      // Note: Our test client is already initialized in beforeEach
      expect(client.isInitialized()).toBe(true);
    });

    it("should allow cleanup and re-initialization", async () => {
      const client = StoreClient.getInstance();

      await client.cleanup();
      expect(client.isInitialized()).toBe(false);

      await client.initialize();
      expect(client.isInitialized()).toBe(true);
    });
  });

  describe("Advanced Configuration", () => {
    it("should support zero debounce for immediate persistence", async () => {
      const persistKey = "test-immediate";
      const store = storeFactory.createPersistedTestStore(
        { value: 0 },
        persistKey,
      );

      store.setState({ value: 42 });

      // With zero debounce, should persist immediately
      await new Promise((resolve) => setTimeout(resolve, 1));

      const storedData = await mockStorage.read(`store:${persistKey}`);
      expect(storedData).not.toBeNull();
    });

    it("should handle complex nested state updates", () => {
      interface NestedState {
        level1: {
          level2: {
            level3: {
              value: number;
              items: string[];
            };
          };
          otherProp: boolean;
        };
        topLevel: string;
      }

      const nestedInitial: NestedState = {
        level1: {
          level2: {
            level3: {
              value: 0,
              items: [],
            },
          },
          otherProp: false,
        },
        topLevel: "initial",
      };

      const store = storeFactory.createTestStore(nestedInitial);

      store.setState((state) => ({
        ...state,
        level1: {
          ...state.level1,
          level2: {
            ...state.level1.level2,
            level3: {
              ...state.level1.level2.level3,
              value: 100,
              items: ["nested-item"],
            },
          },
          otherProp: true,
        },
      }));

      const finalState = store.getState();
      expect(finalState.level1.level2.level3.value).toBe(100);
      expect(finalState.level1.level2.level3.items).toEqual(["nested-item"]);
      expect(finalState.level1.otherProp).toBe(true);
      expect(finalState.topLevel).toBe("initial"); // Should remain unchanged
    });
  });
});
