import { bench, describe } from "vitest";
import createDesktopEventBus from "./exports/desktop/createDesktopEventBus";

type BenchmarkEvents = {
  simple: { data: string };
  benchmark: { test: boolean };
  multi: { value: number };
  pattern: { matched: boolean };
};

describe("EventBus Benchmarks", () => {
  bench("event bus creation", () => {
    createDesktopEventBus<BenchmarkEvents>("benchmark");
  });

  bench("simple event emission", () => {
    const eventBus = createDesktopEventBus<BenchmarkEvents>("benchmark");
    eventBus.emit("simple", { data: "test" });
  });

  bench("subscribe and unsubscribe", () => {
    const eventBus = createDesktopEventBus<BenchmarkEvents>("benchmark");
    const unsubscribe = eventBus.on("simple", () => {});
    unsubscribe();
  });

  bench("once subscription", () => {
    const eventBus = createDesktopEventBus<BenchmarkEvents>("benchmark");
    const unsubscribe = eventBus.once("simple", () => {});
    unsubscribe();
  });

  bench("event with single listener", () => {
    const eventBus = createDesktopEventBus<BenchmarkEvents>("benchmark");
    const unsubscribe = eventBus.on("simple", () => {});
    eventBus.emit("simple", { data: "test" });
    unsubscribe();
  });

  bench("event with multiple listeners (10)", () => {
    const eventBus = createDesktopEventBus<BenchmarkEvents>("benchmark");
    const unsubscribers = Array.from({ length: 10 }, () =>
      eventBus.on("multi", () => {})
    );
    eventBus.emit("multi", { value: 42 });
    unsubscribers.forEach((unsubscribe) => unsubscribe());
  });

  bench("listener count check", () => {
    const eventBus = createDesktopEventBus<BenchmarkEvents>("benchmark");
    const unsubscribe = eventBus.on("simple", () => {});
    eventBus.listenerCount("simple");
    unsubscribe();
  });

  bench("remove all listeners", () => {
    const eventBus = createDesktopEventBus<BenchmarkEvents>("benchmark");
    // Setup some listeners first
    Array.from({ length: 5 }, () => eventBus.on("simple", () => {}));
    eventBus.removeAllListeners();
  });

  bench("domain isolation", () => {
    const bus1 = createDesktopEventBus<BenchmarkEvents>("domain1");
    const bus2 = createDesktopEventBus<BenchmarkEvents>("domain2");

    const unsub1 = bus1.on("simple", () => {});
    const unsub2 = bus2.on("simple", () => {});

    bus1.emit("simple", { data: "test" });
    bus2.emit("simple", { data: "test" });

    unsub1();
    unsub2();
  });

  bench("error handling in listeners", () => {
    const eventBus = createDesktopEventBus<BenchmarkEvents>("benchmark");
    const unsubscribe = eventBus.on("simple", () => {
      throw new Error("Test error");
    });
    eventBus.emit("simple", { data: "test" });
    unsubscribe();
  });

  bench("high frequency events (100)", () => {
    const eventBus = createDesktopEventBus<BenchmarkEvents>("benchmark");
    const unsubscribe = eventBus.on("benchmark", () => {
      // Handler for benchmarking
    });

    for (let i = 0; i < 100; i++) {
      eventBus.emit("benchmark", { test: true });
    }

    unsubscribe();
  });
});
