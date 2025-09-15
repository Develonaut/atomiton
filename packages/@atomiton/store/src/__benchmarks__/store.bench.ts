/**
 * Performance benchmarks for @atomiton/store
 * Ensures the simplified API doesn't introduce performance regressions
 */

import { bench, describe } from "vitest";
import { createStore } from "../index";

describe("Store Performance Benchmarks", () => {
  describe("Store Creation", () => {
    bench("create basic store", () => {
      createStore(() => ({ count: 0 }));
    });

    bench("create store with persistence", () => {
      createStore(() => ({ count: 0 }), {
        persist: { key: "bench-test" },
      });
    });

    bench("create store with complex initial state", () => {
      createStore(() => ({
        users: new Map(),
        settings: { theme: "dark", features: {} },
        history: [] as string[],
        metadata: {},
      }));
    });
  });

  describe("State Updates", () => {
    const store = createStore(() => ({ count: 0, data: { nested: "value" } }));

    bench("simple state update", () => {
      store.setState({ count: Math.random() });
    });

    bench("immer draft update", () => {
      store.setState((state) => {
        state.count++;
      });
    });

    bench("nested state update", () => {
      store.setState((state) => {
        state.data.nested = `value-${Math.random()}`;
      });
    });
  });

  describe("Large State Operations", () => {
    type LargeState = {
      items: Map<string, { id: string; value: number }>;
      metadata: Record<string, unknown>;
    };

    const largeStore = createStore<LargeState>(() => ({
      items: new Map(),
      metadata: {},
    }));

    // Pre-populate with data
    largeStore.setState((state) => {
      for (let i = 0; i < 1000; i++) {
        state.items.set(`item-${i}`, { id: `item-${i}`, value: i });
        state.metadata[`meta-${i}`] = { created: Date.now() };
      }
    });

    bench("update single item in large Map", () => {
      const randomId = `item-${Math.floor(Math.random() * 1000)}`;
      largeStore.setState((state) => {
        const item = state.items.get(randomId);
        if (item) {
          item.value = Math.random();
        }
      });
    });

    bench("add item to large Map", () => {
      const newId = `item-new-${Math.random()}`;
      largeStore.setState((state) => {
        state.items.set(newId, { id: newId, value: Math.random() });
      });
    });

    bench("update metadata in large state", () => {
      const randomKey = `meta-${Math.floor(Math.random() * 1000)}`;
      largeStore.setState((state) => {
        state.metadata[randomKey] = { updated: Date.now() };
      });
    });
  });

  describe("Subscription Performance", () => {
    const store = createStore(() => ({ value: 0 }));

    bench("single subscription update", () => {
      const unsubscribe = store.subscribe(() => {
        // Empty callback for benchmark
      });

      store.setState({ value: Math.random() });
      unsubscribe();
    });

    bench("multiple subscriptions update", () => {
      const unsubscribers: Array<() => void> = [];

      // Create 10 subscriptions
      for (let i = 0; i < 10; i++) {
        const unsub = store.subscribe(() => {
          // Empty callback
        });
        unsubscribers.push(unsub);
      }

      store.setState({ value: Math.random() });

      // Cleanup
      unsubscribers.forEach((unsub) => unsub());
    });
  });

  describe("Rapid Updates", () => {
    const rapidStore = createStore(() => ({ counter: 0 }));

    bench("100 rapid updates", () => {
      for (let i = 0; i < 100; i++) {
        rapidStore.setState((state) => {
          state.counter++;
        });
      }
    });

    bench("1000 rapid updates", () => {
      for (let i = 0; i < 1000; i++) {
        rapidStore.setState((state) => {
          state.counter++;
        });
      }
    });
  });
});
