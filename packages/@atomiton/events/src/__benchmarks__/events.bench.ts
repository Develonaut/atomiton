import { bench, describe } from "vitest";
import { createEvents } from "../testing";

type BenchmarkEvents = {
  simple: { data: string };
  benchmark: { test: boolean };
  multi: { value: number };
  pattern: { matched: boolean };
};

describe("Events Performance", () => {
  bench("events instance creation", () => {
    createEvents<BenchmarkEvents>();
  });

  bench("simple event emission", () => {
    const events = createEvents<BenchmarkEvents>();
    events.emit("simple", { data: "test" });
  });

  bench("subscribe and unsubscribe", () => {
    const events = createEvents<BenchmarkEvents>();
    const unsubscribe = events.on("simple", () => {});
    unsubscribe();
  });

  bench("once subscription", () => {
    const events = createEvents<BenchmarkEvents>();
    const unsubscribe = events.once("simple", () => {});
    unsubscribe();
  });

  bench("event with single listener", () => {
    const events = createEvents<BenchmarkEvents>();
    const unsubscribe = events.on("simple", () => {});
    events.emit("simple", { data: "test" });
    unsubscribe();
  });

  bench("event with multiple listeners (10)", () => {
    const events = createEvents<BenchmarkEvents>();
    const unsubscribers = Array.from({ length: 10 }, () =>
      events.on("multi", () => {}),
    );
    events.emit("multi", { value: 42 });
    unsubscribers.forEach((unsubscribe) => unsubscribe());
  });

  bench("listener count check", () => {
    const events = createEvents<BenchmarkEvents>();
    const unsubscribe = events.on("simple", () => {});
    events.listenerCount("simple");
    unsubscribe();
  });

  bench("remove all listeners", () => {
    const events = createEvents<BenchmarkEvents>();
    // Setup some listeners first
    Array.from({ length: 5 }, () => events.on("simple", () => {}));
    events.removeAllListeners();
  });

  bench("instance isolation", () => {
    const events1 = createEvents<BenchmarkEvents>();
    const events2 = createEvents<BenchmarkEvents>();

    const unsub1 = events1.on("simple", () => {});
    const unsub2 = events2.on("simple", () => {});

    events1.emit("simple", { data: "test" });
    events2.emit("simple", { data: "test" });

    unsub1();
    unsub2();
  });

  bench("error handling in listeners", () => {
    const events = createEvents<BenchmarkEvents>();
    const unsubscribe = events.on("simple", () => {
      throw new Error("Test error");
    });
    events.emit("simple", { data: "test" });
    unsubscribe();
  });

  bench("high frequency events (100)", () => {
    const events = createEvents<BenchmarkEvents>();
    const unsubscribe = events.on("benchmark", () => {
      // Handler for benchmarking
    });

    for (let i = 0; i < 100; i++) {
      events.emit("benchmark", { test: true });
    }

    unsubscribe();
  });
});
