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
});
