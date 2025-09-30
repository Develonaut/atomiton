import { createStore, shallow } from "#index";
import { describe, expect, it } from "vitest";

describe("Store Smoke Tests", () => {
  it("should expose core exports", () => {
    expect(createStore).toBeDefined();
    expect(shallow).toBeDefined();
  });

  it("should create a basic store", () => {
    const testStore = createStore<{ count: number }>(() => ({ count: 0 }), {
      name: "test",
    });

    expect(testStore).toBeDefined();
    expect(testStore.getState).toBeDefined();
    expect(testStore.setState).toBeDefined();
    expect(testStore.subscribe).toBeDefined();
    expect(testStore.useStore).toBeDefined();
    expect(testStore.getState()).toEqual({ count: 0 });
  });

  it("should handle state updates with Immer", () => {
    const testStore = createStore<{ count: number; name: string }>(
      () => ({ count: 0, name: "test" }),
      { name: "test" },
    );

    // Immer-style update
    testStore.setState((state) => {
      state.count = 1;
    });

    expect(testStore.getState().count).toBe(1);
    expect(testStore.getState().name).toBe("test");

    // Partial update
    testStore.setState({ count: 5 });
    expect(testStore.getState().count).toBe(5);
    expect(testStore.getState().name).toBe("test");
  });

  it("should support persistence configuration", () => {
    const testStore = createStore<{ value: string }>(
      () => ({ value: "hello" }),
      {
        name: "test",
        persist: {
          key: "test-store",
        },
      },
    );

    expect(testStore.getState()).toEqual({ value: "hello" });
  });

  it("should support subscriptions", () => {
    const testStore = createStore<{ value: number }>(() => ({ value: 0 }));

    let callCount = 0;
    let lastState: { value: number } | undefined;

    const unsub = testStore.subscribe((state) => {
      callCount++;
      lastState = state;
    });

    testStore.setState((state) => {
      state.value = 42;
    });

    expect(callCount).toBe(1);
    expect(lastState?.value).toBe(42);

    unsub();
  });

  it("should work with complex state structures", () => {
    type ComplexState = {
      users: Map<string, { name: string; age: number }>;
      settings: {
        theme: string;
        notifications: boolean;
      };
      history: string[];
    };

    const store = createStore<ComplexState>(() => ({
      users: new Map(),
      settings: {
        theme: "dark",
        notifications: true,
      },
      history: [],
    }));

    // Test Map operations
    store.setState((state) => {
      state.users.set("user1", { name: "John", age: 30 });
      state.settings.theme = "light";
      state.history.push("action1");
    });

    const state = store.getState();
    expect(state.users.get("user1")).toEqual({ name: "John", age: 30 });
    expect(state.settings.theme).toBe("light");
    expect(state.history).toEqual(["action1"]);
  });

  it("should ensure enableMapSet() initialization works across multiple stores", () => {
    /**
     * This test validates that the lazy initialization of enableMapSet() works correctly:
     * 1. Multiple stores can be created
     * 2. All stores can successfully use Map/Set
     * 3. The initialization happens exactly once (validated by the fact that all stores work)
     *
     * Note: We cannot directly test that enableMapSet() is called only once without mocking,
     * but if it wasn't called or failed, Map/Set operations would throw errors. The success
     * of this test across multiple stores validates proper single initialization.
     */

    type MapState = { data: Map<string, number> };
    type SetState = { items: Set<string> };

    // Create first store with Map
    const store1 = createStore<MapState>(() => ({
      data: new Map([["a", 1]]),
    }));

    // Create second store with Set
    const store2 = createStore<SetState>(() => ({
      items: new Set(["x"]),
    }));

    // Create third store with both
    const store3 = createStore<{
      map: Map<string, string>;
      set: Set<number>;
    }>(() => ({
      map: new Map([["key", "value"]]),
      set: new Set([1, 2, 3]),
    }));

    // Validate all Map/Set operations work across all stores
    store1.setState((state) => {
      state.data.set("b", 2);
    });
    expect(store1.getState().data.get("b")).toBe(2);
    expect(store1.getState().data.size).toBe(2);

    store2.setState((state) => {
      state.items.add("y");
    });
    expect(store2.getState().items.has("y")).toBe(true);
    expect(store2.getState().items.size).toBe(2);

    store3.setState((state) => {
      state.map.set("newKey", "newValue");
      state.set.add(4);
    });
    expect(store3.getState().map.get("newKey")).toBe("newValue");
    expect(store3.getState().set.has(4)).toBe(true);
  });
});
