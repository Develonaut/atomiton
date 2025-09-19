import { describe, it, expect, beforeEach, vi } from "vitest";
import { createEventBus } from "../exports/desktop";

type TestEvents = {
  "user:login": { userId: string; timestamp: number };
  "user:logout": { userId: string };
  "data:update": { id: string; data: unknown };
};

describe("EventBus", () => {
  let eventBus: ReturnType<typeof createEventBus<TestEvents>>;

  beforeEach(() => {
    eventBus = createEventBus<TestEvents>("test");
  });

  describe("Basic functionality", () => {
    it("should emit and receive typed events", () => {
      const listener = vi.fn();
      const unsubscribe = eventBus.on("user:login", listener);

      eventBus.emit("user:login", { userId: "123", timestamp: Date.now() });

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

      const unsubLogin = eventBus.on("user:login", loginListener);
      const unsubLogout = eventBus.on("user:logout", logoutListener);

      eventBus.emit("user:login", { userId: "123", timestamp: Date.now() });
      eventBus.emit("user:logout", { userId: "123" });

      expect(loginListener).toHaveBeenCalledTimes(1);
      expect(logoutListener).toHaveBeenCalledTimes(1);

      unsubLogin();
      unsubLogout();
    });

    it("should handle multiple listeners for same event", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsub1 = eventBus.on("user:login", listener1);
      const unsub2 = eventBus.on("user:login", listener2);

      eventBus.emit("user:login", { userId: "123", timestamp: Date.now() });

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);

      unsub1();
      unsub2();
    });
  });

  describe("Unsubscription", () => {
    it("should unsubscribe correctly", () => {
      const listener = vi.fn();
      const unsubscribe = eventBus.on("user:login", listener);

      eventBus.emit("user:login", { userId: "123", timestamp: Date.now() });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      eventBus.emit("user:login", { userId: "456", timestamp: Date.now() });
      expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it("should handle off method", () => {
      const listener = vi.fn();
      eventBus.on("user:login", listener);

      eventBus.emit("user:login", { userId: "123", timestamp: Date.now() });
      expect(listener).toHaveBeenCalledTimes(1);

      eventBus.off("user:login", listener);

      eventBus.emit("user:login", { userId: "456", timestamp: Date.now() });
      expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called again
    });
  });

  describe("Once subscription", () => {
    it("should only fire once", () => {
      const listener = vi.fn();
      const unsubscribe = eventBus.once("user:login", listener);

      eventBus.emit("user:login", { userId: "123", timestamp: Date.now() });
      eventBus.emit("user:login", { userId: "456", timestamp: Date.now() });
      eventBus.emit("user:login", { userId: "789", timestamp: Date.now() });

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
      expect(eventBus.listenerCount("user:login")).toBe(0);

      const unsub1 = eventBus.on("user:login", vi.fn());
      expect(eventBus.listenerCount("user:login")).toBe(1);

      const unsub2 = eventBus.on("user:login", vi.fn());
      expect(eventBus.listenerCount("user:login")).toBe(2);

      unsub1();
      expect(eventBus.listenerCount("user:login")).toBe(1);

      unsub2();
      expect(eventBus.listenerCount("user:login")).toBe(0);
    });
  });

  describe("Domain isolation", () => {
    it("should isolate events by domain", () => {
      const bus1 = createEventBus<TestEvents>("domain1");
      const bus2 = createEventBus<TestEvents>("domain2");

      const listener1 = vi.fn();
      const listener2 = vi.fn();

      bus1.on("user:login", listener1);
      bus2.on("user:login", listener2);

      bus1.emit("user:login", { userId: "123", timestamp: Date.now() });

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(0);

      bus2.emit("user:login", { userId: "456", timestamp: Date.now() });

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it("should return correct domain name", () => {
      expect(eventBus.getDomain()).toBe("test");
    });
  });

  describe("Error handling", () => {
    it("should handle listener errors gracefully", () => {
      const errorListener = vi.fn(() => {
        throw new Error("Listener error");
      });
      const normalListener = vi.fn();

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      eventBus.on("user:login", errorListener);
      eventBus.on("user:login", normalListener);

      // Should not throw
      expect(() =>
        eventBus.emit("user:login", { userId: "123", timestamp: Date.now() }),
      ).not.toThrow();

      // Normal listener should still be called
      expect(normalListener).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("Remove all listeners", () => {
    it("should remove all listeners", () => {
      eventBus.on("user:login", vi.fn());
      eventBus.on("user:logout", vi.fn());
      eventBus.on("data:update", vi.fn());

      expect(eventBus.listenerCount("user:login")).toBeGreaterThan(0);
      expect(eventBus.listenerCount("user:logout")).toBeGreaterThan(0);
      expect(eventBus.listenerCount("data:update")).toBeGreaterThan(0);

      eventBus.removeAllListeners();

      expect(eventBus.listenerCount("user:login")).toBe(0);
      expect(eventBus.listenerCount("user:logout")).toBe(0);
      expect(eventBus.listenerCount("data:update")).toBe(0);
    });
  });
});
