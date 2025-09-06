/**
 * Store Test Utilities
 * Comprehensive testing helpers for the store architecture
 * Following Brian's testing strategy for clean, maintainable tests
 */

import type { IStorageClient } from "../../clients/storage/IStorageClient";
import { StoreClient } from "../../clients/StoreClient";
import type { ZustandStore, StoreConfig } from "../../clients/StoreClient";

// =================================
// Mock Storage Client for Testing
// =================================

export class MockStorageClient implements IStorageClient {
  private storage = new Map<string, Buffer>();
  private initialized = false;
  private shouldFail = false;

  async initialize(): Promise<void> {
    if (this.shouldFail) {
      throw new Error("Mock storage initialization failed");
    }
    this.initialized = true;
  }

  async read(key: string): Promise<Buffer | null> {
    if (this.shouldFail) {
      throw new Error("Mock storage read failed");
    }
    return this.storage.get(key) || null;
  }

  async write(key: string, data: Buffer): Promise<void> {
    if (this.shouldFail) {
      throw new Error("Mock storage write failed");
    }
    this.storage.set(key, data);
  }

  async delete(key: string): Promise<void> {
    if (this.shouldFail) {
      throw new Error("Mock storage delete failed");
    }
    this.storage.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    if (this.shouldFail) {
      throw new Error("Mock storage exists failed");
    }
    return this.storage.has(key);
  }

  async list(prefix?: string): Promise<string[]> {
    if (this.shouldFail) {
      throw new Error("Mock storage list failed");
    }
    const keys = Array.from(this.storage.keys());
    return prefix ? keys.filter((key) => key.startsWith(prefix)) : keys;
  }

  async clear(): Promise<void> {
    if (this.shouldFail) {
      throw new Error("Mock storage clear failed");
    }
    this.storage.clear();
  }

  async cleanup(): Promise<void> {
    this.storage.clear();
    this.initialized = false;
  }

  async writeBatch(
    entries: Array<{ key: string; data: Buffer }>,
  ): Promise<void> {
    if (this.shouldFail) {
      throw new Error("Mock storage writeBatch failed");
    }
    for (const { key, data } of entries) {
      this.storage.set(key, data);
    }
  }

  async readBatch(keys: string[]): Promise<Array<Buffer | null>> {
    if (this.shouldFail) {
      throw new Error("Mock storage readBatch failed");
    }
    return keys.map((key) => this.storage.get(key) || null);
  }

  async deleteBatch(keys: string[]): Promise<void> {
    if (this.shouldFail) {
      throw new Error("Mock storage deleteBatch failed");
    }
    for (const key of keys) {
      this.storage.delete(key);
    }
  }

  async getSize(key: string): Promise<number> {
    if (this.shouldFail) {
      throw new Error("Mock storage getSize failed");
    }
    const buffer = this.storage.get(key);
    return buffer ? buffer.length : 0;
  }

  async getTotalSize(): Promise<number> {
    if (this.shouldFail) {
      throw new Error("Mock storage getTotalSize failed");
    }
    let total = 0;
    for (const buffer of this.storage.values()) {
      total += buffer.length;
    }
    return total;
  }

  // Test utilities
  getStoredData(): Map<string, Buffer> {
    return new Map(this.storage);
  }

  clearStorage(): void {
    this.storage.clear();
  }

  simulateFailure(shouldFail = true): void {
    this.shouldFail = shouldFail;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// =================================
// Store Test Factory
// =================================

export class StoreTestFactory {
  private mockStorage: MockStorageClient;
  private storeClient: StoreClient;
  private testStoreClient: TestStoreClient;

  constructor() {
    this.mockStorage = new MockStorageClient();
    this.testStoreClient = new TestStoreClient(this.mockStorage);
    this.storeClient = StoreClient.getInstance();
  }

  /**
   * Create a test store with default configuration
   */
  createTestStore<T extends object>(
    initialState: T,
    config?: Partial<StoreConfig<T>>,
  ): ZustandStore<T> {
    const fullConfig: StoreConfig<T> = {
      initialState,
      persist: false,
      persistKey: "test-store",
      persistDebounce: 0, // No debounce in tests
      ...config,
    };

    return this.storeClient.createZustandStore(fullConfig);
  }

  /**
   * Create a persisted test store
   */
  createPersistedTestStore<T extends object>(
    initialState: T,
    persistKey: string,
    options?: {
      persistFilter?: (state: T) => Partial<T>;
      hydrateTransform?: (persisted: unknown) => T;
    },
  ): ZustandStore<T> {
    const config: StoreConfig<T> = {
      initialState,
      persist: true,
      persistKey,
      persistDebounce: 0,
      ...options,
    };

    return this.storeClient.createZustandStore(config);
  }

  /**
   * Get mock storage for inspecting persisted data
   */
  getMockStorage(): MockStorageClient {
    return this.mockStorage;
  }

  /**
   * Initialize the store client for persistence tests
   */
  async initializeStoreClient(): Promise<void> {
    await this.testStoreClient.initialize();
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.storeClient.cleanup();
    await this.mockStorage.cleanup();
  }
}

// =================================
// Test Store Client (with Mock Injection)
// =================================

class TestStoreClient {
  private mockStorageClient: MockStorageClient;
  private storeInstance: StoreClient;

  constructor(mockStorage: MockStorageClient) {
    this.mockStorageClient = mockStorage;
    // Get the singleton instance
    this.storeInstance = StoreClient.getInstance();
  }

  async initialize(): Promise<void> {
    // Override to use our mock storage instead of platform detection
    await this.mockStorageClient.initialize();
    // Use type assertion to access private properties for testing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.storeInstance as any).storageClient = this.mockStorageClient;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.storeInstance as any).initialized = true;
  }

  createZustandStore<T extends object>(
    config: StoreConfig<T>,
  ): ZustandStore<T> {
    return this.storeInstance.createZustandStore(config);
  }

  async cleanup(): Promise<void> {
    await this.storeInstance.cleanup();
  }
}

// =================================
// Test State Assertions
// =================================

export class StoreAssertions {
  /**
   * Assert that state matches expected shape
   */
  static assertStateShape<T extends object>(
    actual: T,
    expected: Partial<T>,
    message?: string,
  ): void {
    for (const [key, value] of Object.entries(expected)) {
      if (!(key in actual)) {
        throw new Error(
          `${message || "State assertion failed"}: Missing key '${key}'`,
        );
      }

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        // Deep comparison for objects
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(actual[key as keyof T]).toMatchObject(value as any);
      } else {
        expect(actual[key as keyof T]).toEqual(value);
      }
    }
  }

  /**
   * Assert that a Map contains expected entries
   */
  static assertMapContains<K, V>(
    map: Map<K, V>,
    expectedEntries: [K, V][],
    message?: string,
  ): void {
    for (const [key, expectedValue] of expectedEntries) {
      if (!map.has(key)) {
        throw new Error(
          `${message || "Map assertion failed"}: Missing key '${key}'`,
        );
      }
      expect(map.get(key)).toEqual(expectedValue);
    }
  }

  /**
   * Assert that an array contains expected items (order independent)
   */
  static assertArrayContains<T>(
    array: T[],
    expectedItems: T[],
    message?: string,
  ): void {
    for (const item of expectedItems) {
      if (!array.includes(item)) {
        throw new Error(
          `${message || "Array assertion failed"}: Missing item '${item}'`,
        );
      }
    }
  }

  /**
   * Assert store persistence behavior
   */
  static async assertPersistence<T extends object>(
    factory: StoreTestFactory,
    persistKey: string,
    storeCreator: () => ZustandStore<T>,
    stateChanger: (store: ZustandStore<T>) => void,
    expectedPersistedData: unknown,
  ): Promise<void> {
    const store1 = storeCreator();
    stateChanger(store1);

    // Allow some time for async persistence
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Check that data was persisted
    const mockStorage = factory.getMockStorage();
    const persistedBuffer = await mockStorage.read(`store:${persistKey}`);
    expect(persistedBuffer).not.toBeNull();

    if (persistedBuffer) {
      const persistedData = JSON.parse(persistedBuffer.toString("utf-8"));
      expect(persistedData.state).toMatchObject(
        expectedPersistedData as object,
      );
    }

    // Create new store to test hydration
    const store2 = storeCreator();
    const hydratedState = store2.getState();
    expect(hydratedState).toMatchObject(expectedPersistedData as object);
  }
}

// =================================
// Test Data Generators
// =================================

export class TestDataGenerator {
  private static counter = 0;

  /**
   * Generate unique test IDs
   */
  static generateId(prefix = "test"): string {
    return `${prefix}-${++TestDataGenerator.counter}-${Date.now()}`;
  }

  /**
   * Generate test blueprint
   */
  static generateBlueprint(
    overrides?: Partial<Record<string, unknown>>,
  ): Record<string, unknown> {
    const id = TestDataGenerator.generateId("blueprint");
    const now = new Date();

    return {
      id,
      name: `Test Blueprint ${id}`,
      description: `Description for ${id}`,
      version: "1.0.0",
      author: "Test Author",
      created: now,
      modified: now,
      tags: ["test", "automation"],
      nodes: [],
      connections: [],
      metadata: { test: true },
      ...overrides,
    };
  }

  /**
   * Generate test job
   */
  static generateJob(
    overrides?: Partial<Record<string, unknown>>,
  ): Record<string, unknown> {
    const id = TestDataGenerator.generateId("job");
    const blueprintId =
      overrides?.blueprintId || TestDataGenerator.generateId("blueprint");

    return {
      id,
      blueprintId,
      blueprintName: `Test Blueprint for ${id}`,
      status: "queued" as const,
      priority: 1,
      created: new Date(),
      modified: new Date(),
      progress: { current: 0, total: 100, percentage: 0 },
      inputs: {},
      outputs: {},
      tags: ["test"],
      nodeStates: new Map(),
      ...overrides,
    };
  }

  /**
   * Reset counter for predictable tests
   */
  static resetCounter(): void {
    TestDataGenerator.counter = 0;
  }
}

// =================================
// Common Test Patterns
// =================================

export class TestPatterns {
  /**
   * Test basic store CRUD operations
   */
  static testStoreCRUD<T extends object, K>(
    store: ZustandStore<T>,
    actions: Record<string, (...params: unknown[]) => void>,
    selectors: Record<string, unknown>,
    testData: {
      itemToAdd: K;
      itemId: string;
      updates: Partial<K>;
      getItems: (state: T) => K[];
      getItemById: (state: T, id: string) => K | null;
    },
  ): void {
    describe("CRUD Operations", () => {
      it("should add items", () => {
        const initialState = store.getState();
        expect(testData.getItems(initialState)).toHaveLength(0);

        actions.add(testData.itemToAdd);

        const afterAdd = store.getState();
        const items = testData.getItems(afterAdd);
        expect(items).toHaveLength(1);
        expect(items[0]).toMatchObject(testData.itemToAdd as object);
      });

      it("should read items", () => {
        actions.add(testData.itemToAdd);

        const state = store.getState();
        const item = testData.getItemById(state, testData.itemId);
        expect(item).toMatchObject(testData.itemToAdd as object);
      });

      it("should update items", () => {
        actions.add(testData.itemToAdd);
        actions.update(testData.itemId, testData.updates);

        const state = store.getState();
        const item = testData.getItemById(state, testData.itemId);
        expect(item).toMatchObject({
          ...testData.itemToAdd,
          ...testData.updates,
        } as object);
      });

      it("should delete items", () => {
        actions.add(testData.itemToAdd);

        let state = store.getState();
        expect(testData.getItems(state)).toHaveLength(1);

        actions.delete(testData.itemId);

        state = store.getState();
        expect(testData.getItems(state)).toHaveLength(0);
      });
    });
  }

  /**
   * Test subscription behavior
   */
  static testSubscriptions<T extends object>(
    store: ZustandStore<T>,
    stateChanger: (store: ZustandStore<T>) => void,
  ): void {
    describe("Subscriptions", () => {
      it("should notify subscribers on state change", () => {
        const mockCallback = vi.fn();
        const unsubscribe = store.subscribe(mockCallback);

        stateChanger(store);

        expect(mockCallback).toHaveBeenCalled();
        unsubscribe();
      });

      it("should stop notifications after unsubscribe", () => {
        const mockCallback = vi.fn();
        const unsubscribe = store.subscribe(mockCallback);
        unsubscribe();

        stateChanger(store);

        expect(mockCallback).not.toHaveBeenCalled();
      });
    });
  }
}
