import { bench, describe } from "vitest";
import { store } from "../api";
import type { Store } from "../base";

describe("Store API Performance", () => {
  bench("store initialization", async () => {
    await store.initialize();
    store.cleanup();
  });

  bench("create simple store", () => {
    store.createStore({
      name: "bench",
      initialState: { count: 0 },
    });
  });

  bench("state update (small object)", () => {
    const testStore = store.createStore({
      name: "bench",
      initialState: { count: 0 },
    });

    testStore.setState({ count: Math.random() });
  });

  bench("state update (large object)", () => {
    const largeState = {
      nodes: Array.from({ length: 100 }, (_, i) => ({
        id: `node-${i}`,
        type: "atomic",
        position: { x: i * 10, y: i * 10 },
        data: { value: i },
      })),
      connections: Array.from({ length: 50 }, (_, i) => ({
        id: `conn-${i}`,
        source: `node-${i}`,
        target: `node-${i + 1}`,
      })),
      metadata: {
        name: "benchmark",
        version: "1.0.0",
        created: Date.now(),
      },
    };

    const testStore = store.createStore({
      name: "bench",
      initialState: largeState,
    });

    testStore.setState((state) => {
      state.nodes[0].data.value = Math.random();
    });
  });

  bench("action execution", () => {
    const testStore = store.createStore({
      name: "bench",
      initialState: { count: 0, multiplier: 2 },
    });

    const increment = store.createAction(testStore, (state, amount: number) => {
      state.count += amount;
    });

    increment(1);
  });

  bench("selector execution", () => {
    const testStore = store.createStore({
      name: "bench",
      initialState: { count: 100, multiplier: 2 },
    });

    const getTotal = store.createSelector(
      testStore,
      (state) => state.count * state.multiplier,
    );

    getTotal();
  });

  bench("combine stores (2 stores)", () => {
    const store1 = store.createStore({
      name: "store1",
      initialState: { value: 1 },
    });

    const store2 = store.createStore({
      name: "store2",
      initialState: { value: 2 },
    });

    const combined = store.combineStores({
      store1: store1 as Store<unknown>,
      store2: store2 as Store<unknown>,
    });
    combined.getState();
  });

  bench("store registration and retrieval", () => {
    const testStore = store.createStore({
      name: "bench",
      initialState: { value: "test" },
    });

    store.registerStore("benchStore", testStore);
    store.getRegisteredStore("benchStore");
    store.unregisterStore("benchStore");
  });

  bench("batch state updates (10 updates)", () => {
    const testStore = store.createStore({
      name: "bench",
      initialState: {
        counters: Array.from({ length: 10 }, (_, i) => ({ id: i, value: 0 })),
      },
    });

    for (let i = 0; i < 10; i++) {
      testStore.setState((state) => {
        state.counters[i].value = Math.random();
      });
    }
  });

  bench("subscription handling", () => {
    const testStore = store.createStore({
      name: "bench",
      initialState: { count: 0 },
    });

    const unsubscribe = testStore.subscribe(() => {
      // Subscription callback
    });

    testStore.setState({ count: 1 });
    unsubscribe();
  });
});

describe("Store Memory Performance", () => {
  bench("create 100 stores", () => {
    Array.from({ length: 100 }, (_, i) =>
      store.createStore({
        name: `store-${i}`,
        initialState: { id: i, value: Math.random() },
      }),
    );
  });

  bench("register and clear 100 stores", () => {
    const stores = Array.from({ length: 100 }, (_, i) =>
      store.createStore({
        name: `store-${i}`,
        initialState: { id: i },
      }),
    );

    stores.forEach((s, i) => {
      store.registerStore(`store-${i}`, s);
    });

    store.clearRegisteredStores();
  });
});
