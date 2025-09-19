import { describe, it, expect, beforeEach, vi } from "vitest";
import { createEvents } from "../testing";

type TestEvents = {
  "user:login": { userId: string; timestamp: number };
  "user:logout": { userId: string };
  "data:update": { id: string; data: unknown };
};

describe("Events", () => {
  let events: ReturnType<typeof createEvents<TestEvents>>;

  beforeEach(() => {
    events = createEvents<TestEvents>();
  });

  describe("Basic functionality", () => {
    it("should emit and receive typed events", () => {
      const listener = vi.fn();
      const unsubscribe = events.on("user:login", listener);

      events.emit("user:login", { userId: "123", timestamp: Date.now() });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({
        userId: "123",
        timestamp: expect.any(Number),
      });

      unsubscribe();
    });

    it("should handle multiple event types", () => {
      const loginListener = vi.fn();
      const logoutListener = vi.fn();

      const unsubLogin = events.on("user:login", loginListener);
      const unsubLogout = events.on("user:logout", logoutListener);

      events.emit("user:login", { userId: "123", timestamp: Date.now() });
      events.emit("user:logout", { userId: "123" });

      expect(loginListener).toHaveBeenCalledTimes(1);
      expect(logoutListener).toHaveBeenCalledTimes(1);

      unsubLogin();
      unsubLogout();
    });

    it("should handle multiple listeners for same event", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsub1 = events.on("user:login", listener1);
      const unsub2 = events.on("user:login", listener2);

      events.emit("user:login", { userId: "123", timestamp: Date.now() });

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);

      unsub1();
      unsub2();
    });
  });

  describe("Unsubscription", () => {
    it("should unsubscribe correctly", () => {
      const listener = vi.fn();
      const unsubscribe = events.on("user:login", listener);

      events.emit("user:login", { userId: "123", timestamp: Date.now() });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      events.emit("user:login", { userId: "456", timestamp: Date.now() });
      expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it("should handle off method", () => {
      const listener = vi.fn();
      events.on("user:login", listener);

      events.emit("user:login", { userId: "123", timestamp: Date.now() });
      expect(listener).toHaveBeenCalledTimes(1);

      events.off("user:login", listener);

      events.emit("user:login", { userId: "456", timestamp: Date.now() });
      expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called again
    });
  });

  describe("Once subscription", () => {
    it("should only fire once", () => {
      const listener = vi.fn();
      const unsubscribe = events.once("user:login", listener);

      events.emit("user:login", { userId: "123", timestamp: Date.now() });
      events.emit("user:login", { userId: "456", timestamp: Date.now() });
      events.emit("user:login", { userId: "789", timestamp: Date.now() });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({
        userId: "123",
        timestamp: expect.any(Number),
      });

      unsubscribe();
    });
  });

  describe("Listener count", () => {
    it("should track listener count correctly", () => {
      expect(events.listenerCount("user:login")).toBe(0);

      const unsub1 = events.on("user:login", vi.fn());
      expect(events.listenerCount("user:login")).toBe(1);

      const unsub2 = events.on("user:login", vi.fn());
      expect(events.listenerCount("user:login")).toBe(2);

      unsub1();
      expect(events.listenerCount("user:login")).toBe(1);

      unsub2();
      expect(events.listenerCount("user:login")).toBe(0);
    });
  });

  describe("Instance isolation", () => {
    it("should isolate events between instances", () => {
      const events1 = createEvents<TestEvents>();
      const events2 = createEvents<TestEvents>();

      const listener1 = vi.fn();
      const listener2 = vi.fn();

      events1.on("user:login", listener1);
      events2.on("user:login", listener2);

      events1.emit("user:login", { userId: "123", timestamp: Date.now() });

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(0);

      events2.emit("user:login", { userId: "456", timestamp: Date.now() });

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error handling", () => {
    it("should propagate listener errors", () => {
      const errorListener = vi.fn(() => {
        throw new Error("Listener error");
      });

      events.on("user:login", errorListener);

      // EventEmitter3 propagates errors from listeners
      expect(() =>
        events.emit("user:login", { userId: "123", timestamp: Date.now() }),
      ).toThrow("Listener error");

      expect(errorListener).toHaveBeenCalled();
    });
  });

  describe("Remove all listeners", () => {
    it("should remove all listeners", () => {
      events.on("user:login", vi.fn());
      events.on("user:logout", vi.fn());
      events.on("data:update", vi.fn());

      expect(events.listenerCount("user:login")).toBeGreaterThan(0);
      expect(events.listenerCount("user:logout")).toBeGreaterThan(0);
      expect(events.listenerCount("data:update")).toBeGreaterThan(0);

      events.removeAllListeners();

      expect(events.listenerCount("user:login")).toBe(0);
      expect(events.listenerCount("user:logout")).toBe(0);
      expect(events.listenerCount("data:update")).toBe(0);
    });
  });
});
