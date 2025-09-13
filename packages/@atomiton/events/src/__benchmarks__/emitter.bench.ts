import { bench, describe } from "vitest";
import {
  emit,
  subscribe,
  broadcast,
  clearAllListeners,
  createEvent,
  subscribeFiltered,
  once,
  getListenerCount,
} from "../emitter";
import type { SystemEvent } from "../types";

describe("Events System Performance", () => {
  bench("event creation", () => {
    createEvent("benchmark-test", "benchmark-source", { data: "test" });
  });

  bench("simple event emission", () => {
    const event: SystemEvent = {
      type: "benchmark",
      source: "test",
      timestamp: Date.now(),
      data: { test: true },
    };
    emit(event);
  });

  bench("broadcast event", () => {
    broadcast("benchmark-broadcast", "test-source", { value: 42 });
  });

  bench("subscribe and unsubscribe", () => {
    const sub = subscribe(() => {});
    sub.unsubscribe();
  });

  bench("filtered subscription", () => {
    const sub = subscribeFiltered({ type: "specific-type" }, () => {});
    sub.unsubscribe();
  });

  bench("once subscription", () => {
    const sub = once(() => {});
    sub.unsubscribe();
  });

  bench("event with single listener", () => {
    const sub = subscribe(() => {});
    broadcast("single-listener", "source");
    sub.unsubscribe();
  });

  bench("event with multiple listeners (10)", () => {
    const subs = Array.from({ length: 10 }, () => subscribe(() => {}));
    broadcast("multi-listener", "source");
    subs.forEach((sub) => sub.unsubscribe());
  });

  bench("filtered event matching", () => {
    const sub = subscribeFiltered({ type: "filter-test" }, () => {});
    broadcast("filter-test", "source", { matched: true });
    sub.unsubscribe();
  });

  bench("filtered event non-matching", () => {
    const sub = subscribeFiltered({ type: "filter-test" }, () => {});
    broadcast("other-type", "source", { matched: false });
    sub.unsubscribe();
  });

  bench("listener count check", () => {
    getListenerCount();
  });

  bench("clear all listeners", () => {
    // Setup some listeners first
    const subs = Array.from({ length: 5 }, () => subscribe(() => {}));
    clearAllListeners();
  });

  bench("regex pattern filtering", () => {
    const sub = subscribeFiltered({ type: /^test:.*/ }, () => {});
    broadcast("test:pattern", "source");
    sub.unsubscribe();
  });

  bench("array pattern filtering", () => {
    const sub = subscribeFiltered(
      { type: ["type1", "type2", "type3"] },
      () => {},
    );
    broadcast("type2", "source");
    sub.unsubscribe();
  });
});
