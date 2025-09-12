import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  emit,
  subscribe,
  subscribeFiltered,
  once,
  broadcast,
  clearAllListeners,
  getListenerCount,
} from "../emitter";
import type { SystemEvent } from "../types";

describe("Event Emitter", () => {
  beforeEach(() => {
    clearAllListeners();
  });

  describe("Basic functionality", () => {
    it("should emit and receive events", () => {
      const listener = vi.fn();
      const subscription = subscribe(listener);

      const event: SystemEvent = {
        type: "test",
        source: "test-source",
        timestamp: Date.now(),
        data: { message: "hello" },
      };

      emit(event);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "test",
          source: "test-source",
          data: { message: "hello" },
        }),
      );

      subscription.unsubscribe();
    });

    it("should handle multiple subscribers", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const sub1 = subscribe(listener1);
      const sub2 = subscribe(listener2);

      broadcast("multi-test", "source", { value: 42 });

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);

      sub1.unsubscribe();
      sub2.unsubscribe();
    });

    it("should unsubscribe correctly", () => {
      const listener = vi.fn();
      const subscription = subscribe(listener);

      broadcast("test1", "source");
      expect(listener).toHaveBeenCalledTimes(1);

      subscription.unsubscribe();

      broadcast("test2", "source");
      expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called again
    });
  });

  describe("Filtered subscriptions", () => {
    it("should filter by event type", () => {
      const listener = vi.fn();
      const subscription = subscribeFiltered(
        { type: "specific-type" },
        listener,
      );

      broadcast("other-type", "source");
      expect(listener).not.toHaveBeenCalled();

      broadcast("specific-type", "source");
      expect(listener).toHaveBeenCalledTimes(1);

      subscription.unsubscribe();
    });

    it("should filter by source", () => {
      const listener = vi.fn();
      const subscription = subscribeFiltered(
        { source: "specific-source" },
        listener,
      );

      broadcast("test", "other-source");
      expect(listener).not.toHaveBeenCalled();

      broadcast("test", "specific-source");
      expect(listener).toHaveBeenCalledTimes(1);

      subscription.unsubscribe();
    });

    it("should filter by regex pattern", () => {
      const listener = vi.fn();
      const subscription = subscribeFiltered({ type: /^user:.*/ }, listener);

      broadcast("system:event", "source");
      expect(listener).not.toHaveBeenCalled();

      broadcast("user:login", "source");
      broadcast("user:logout", "source");
      expect(listener).toHaveBeenCalledTimes(2);

      subscription.unsubscribe();
    });

    it("should filter by array of values", () => {
      const listener = vi.fn();
      const subscription = subscribeFiltered(
        { type: ["event1", "event2", "event3"] },
        listener,
      );

      broadcast("event4", "source");
      expect(listener).not.toHaveBeenCalled();

      broadcast("event1", "source");
      broadcast("event2", "source");
      expect(listener).toHaveBeenCalledTimes(2);

      subscription.unsubscribe();
    });
  });

  describe("Once subscription", () => {
    it("should only fire once", () => {
      const listener = vi.fn();
      const subscription = once(listener);

      broadcast("once-test", "source");
      broadcast("once-test", "source");
      broadcast("once-test", "source");

      expect(listener).toHaveBeenCalledTimes(1);

      subscription.unsubscribe();
    });
  });

  describe("Listener count", () => {
    it("should track listener count correctly", () => {
      expect(getListenerCount()).toBe(0);

      const sub1 = subscribe(vi.fn());
      expect(getListenerCount()).toBe(1);

      const sub2 = subscribe(vi.fn());
      expect(getListenerCount()).toBe(2);

      sub1.unsubscribe();
      expect(getListenerCount()).toBe(1);

      sub2.unsubscribe();
      expect(getListenerCount()).toBe(0);
    });
  });

  describe("Clear all listeners", () => {
    it("should remove all listeners", () => {
      subscribe(vi.fn());
      subscribe(vi.fn());
      subscribeFiltered({ type: "test" }, vi.fn());

      expect(getListenerCount()).toBeGreaterThan(0);

      clearAllListeners();

      expect(getListenerCount()).toBe(0);
    });
  });

  describe("Error handling", () => {
    it("should handle listener errors gracefully", () => {
      const errorListener = vi.fn(() => {
        throw new Error("Listener error");
      });
      const normalListener = vi.fn();

      const sub1 = subscribe(errorListener);
      const sub2 = subscribe(normalListener);

      // Should not throw
      expect(() => broadcast("error-test", "source")).not.toThrow();

      // Normal listener should still be called
      expect(normalListener).toHaveBeenCalled();

      sub1.unsubscribe();
      sub2.unsubscribe();
    });
  });
});
