import { describe, it, expect, beforeEach } from "vitest";
import { store } from "../api";

describe("Store API Smoke Tests", () => {
  beforeEach(() => {
    store.cleanup();
  });

  it("should initialize without errors", async () => {
    await expect(store.initialize()).resolves.not.toThrow();
    expect(store.isInitialized()).toBe(true);
  });

  it("should expose core methods", () => {
    expect(store.initialize).toBeDefined();
    expect(store.createStore).toBeDefined();
    expect(store.createAction).toBeDefined();
    expect(store.createActions).toBeDefined();
    expect(store.createSelector).toBeDefined();
    expect(store.createSelectors).toBeDefined();
    expect(store.combineStores).toBeDefined();
    expect(store.registerStore).toBeDefined();
    expect(store.getRegisteredStore).toBeDefined();
  });

  it("should create a basic store", () => {
    const testStore = store.createStore({
      name: "test",
      initialState: { count: 0 },
    });

    expect(testStore).toBeDefined();
    expect(testStore.getState).toBeDefined();
    expect(testStore.setState).toBeDefined();
    expect(testStore.subscribe).toBeDefined();
    expect(testStore.getState()).toEqual({ count: 0 });
  });

  it("should handle state updates", () => {
    const testStore = store.createStore({
      name: "test",
      initialState: { count: 0, name: "test" },
    });

    testStore.setState({ count: 1 });
    expect(testStore.getState().count).toBe(1);
    expect(testStore.getState().name).toBe("test");
  });

  it("should register and retrieve stores", () => {
    const testStore = store.createStore({
      name: "test",
      initialState: { value: "hello" },
    });

    store.registerStore("testStore", testStore);
    const retrieved = store.getRegisteredStore("testStore");

    expect(retrieved).toBeDefined();
    expect(retrieved?.getState()).toEqual({ value: "hello" });
  });

  it("should create and execute actions", () => {
    const testStore = store.createStore({
      name: "test",
      initialState: { count: 0 },
    });

    const increment = store.createAction(testStore, (state, amount: number) => {
      state.count += amount;
    });

    increment(5);
    expect(testStore.getState().count).toBe(5);
  });

  it("should create and use selectors", () => {
    const testStore = store.createStore({
      name: "test",
      initialState: { count: 10, multiplier: 2 },
    });

    const getTotal = store.createSelector(
      testStore,
      (state) => state.count * state.multiplier,
    );

    expect(getTotal()).toBe(20);
  });

  it("should combine multiple stores", () => {
    const store1 = store.createStore({
      name: "store1",
      initialState: { value: "a" },
    });

    const store2 = store.createStore({
      name: "store2",
      initialState: { value: "b" },
    });

    const combined = store.combineStores({ store1, store2 });
    const state = combined.getState();

    expect(state.store1.value).toBe("a");
    expect(state.store2.value).toBe("b");
  });

  it("should handle cleanup properly", () => {
    const testStore = store.createStore({
      name: "test",
      initialState: { value: "test" },
    });

    store.registerStore("cleanupTest", testStore);
    expect(store.getRegisteredStoreNames()).toContain("cleanupTest");

    store.clearRegisteredStores();
    expect(store.getRegisteredStoreNames()).toHaveLength(0);
  });
});
