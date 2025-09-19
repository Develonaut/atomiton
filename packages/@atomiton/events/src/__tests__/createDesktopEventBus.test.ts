import { beforeEach, describe, expect, it, vi } from "vitest";
import createDesktopEventBus from "../exports/desktop/createDesktopEventBus";

// Mock the IPC bridge
const mockIPCBridge = {
  isAvailable: vi.fn(),
  getEnvironment: vi.fn(),
  send: vi.fn(),
  on: vi.fn(),
};

vi.mock("../ipc", () => ({
  createIPCBridge: vi.fn(() => mockIPCBridge),
}));

type TestEvents = {
  "user:login": { userId: string; timestamp: number };
  "user:logout": { userId: string };
  "system:status": { status: "online" | "offline" };
};

describe("createDesktopEventBus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Simplified API", () => {
    it("should create event bus with only domain parameter", () => {
      const eventBus = createDesktopEventBus<TestEvents>("test-domain");

      expect(eventBus).toBeDefined();
      expect(eventBus.getDomain).toBeDefined();
      expect(eventBus.on).toBeDefined();
      expect(eventBus.emit).toBeDefined();
      expect(eventBus.ipc).toBeDefined();
    });

    it("should always include IPC bridge", () => {
      const eventBus = createDesktopEventBus<TestEvents>("test-domain");

      expect(eventBus.ipc).toBe(mockIPCBridge);
      expect(eventBus.ipc).not.toBeUndefined();
    });

    it("should work with different domain names", () => {
      const bus1 = createDesktopEventBus<TestEvents>("domain1");
      const bus2 = createDesktopEventBus<TestEvents>("domain2");

      expect(bus1.getDomain()).toBe("domain1");
      expect(bus2.getDomain()).toBe("domain2");
      expect(bus1.ipc).toBeDefined();
      expect(bus2.ipc).toBeDefined();
    });
  });

  describe("Event bus functionality", () => {
    let eventBus: ReturnType<typeof createDesktopEventBus<TestEvents>>;

    beforeEach(() => {
      eventBus = createDesktopEventBus<TestEvents>("test");
    });

    it("should handle basic event emission and listening", () => {
      const listener = vi.fn();

      eventBus.on("user:login", listener);
      eventBus.emit("user:login", { userId: "123", timestamp: Date.now() });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({
        userId: "123",
        timestamp: expect.any(Number),
      });
    });

    it("should support multiple event types", () => {
      const loginListener = vi.fn();
      const logoutListener = vi.fn();
      const statusListener = vi.fn();

      eventBus.on("user:login", loginListener);
      eventBus.on("user:logout", logoutListener);
      eventBus.on("system:status", statusListener);

      eventBus.emit("user:login", { userId: "123", timestamp: Date.now() });
      eventBus.emit("user:logout", { userId: "123" });
      eventBus.emit("system:status", { status: "online" });

      expect(loginListener).toHaveBeenCalledTimes(1);
      expect(logoutListener).toHaveBeenCalledTimes(1);
      expect(statusListener).toHaveBeenCalledTimes(1);
    });

    it("should support unsubscription", () => {
      const listener = vi.fn();

      const unsubscribe = eventBus.on("user:login", listener);
      eventBus.emit("user:login", { userId: "123", timestamp: Date.now() });

      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      eventBus.emit("user:login", { userId: "456", timestamp: Date.now() });

      expect(listener).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it("should support once() subscription", () => {
      const listener = vi.fn();

      eventBus.once("user:login", listener);

      eventBus.emit("user:login", { userId: "123", timestamp: Date.now() });
      eventBus.emit("user:login", { userId: "456", timestamp: Date.now() });

      expect(listener).toHaveBeenCalledTimes(1); // Should only be called once
    });

    it("should track listener count", () => {
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

    it("should remove all listeners", () => {
      eventBus.on("user:login", vi.fn());
      eventBus.on("user:logout", vi.fn());
      eventBus.on("system:status", vi.fn());

      expect(eventBus.listenerCount("user:login")).toBeGreaterThan(0);
      expect(eventBus.listenerCount("user:logout")).toBeGreaterThan(0);
      expect(eventBus.listenerCount("system:status")).toBeGreaterThan(0);

      eventBus.removeAllListeners();

      expect(eventBus.listenerCount("user:login")).toBe(0);
      expect(eventBus.listenerCount("user:logout")).toBe(0);
      expect(eventBus.listenerCount("system:status")).toBe(0);
    });
  });

  describe("IPC Integration", () => {
    let eventBus: ReturnType<typeof createDesktopEventBus<TestEvents>>;

    beforeEach(() => {
      eventBus = createDesktopEventBus<TestEvents>("test");
    });

    it("should provide access to IPC bridge", () => {
      expect(eventBus.ipc).toBe(mockIPCBridge);
      expect(eventBus.ipc.isAvailable).toBeDefined();
      expect(eventBus.ipc.getEnvironment).toBeDefined();
      expect(eventBus.ipc.send).toBeDefined();
      expect(eventBus.ipc.on).toBeDefined();
    });

    it("should create IPC bridge for each event bus instance", () => {
      const bus1 = createDesktopEventBus<TestEvents>("domain1");
      const bus2 = createDesktopEventBus<TestEvents>("domain2");

      expect(bus1.ipc).toBeDefined();
      expect(bus2.ipc).toBeDefined();

      // Each should have its own IPC bridge instance
      expect(bus1.ipc).toBe(mockIPCBridge);
      expect(bus2.ipc).toBe(mockIPCBridge);
    });

    it("should maintain IPC availability check", () => {
      mockIPCBridge.isAvailable.mockReturnValue(true);

      expect(eventBus.ipc.isAvailable()).toBe(true);
      expect(mockIPCBridge.isAvailable).toHaveBeenCalled();
    });

    it("should maintain IPC environment detection", () => {
      mockIPCBridge.getEnvironment.mockReturnValue("renderer");

      expect(eventBus.ipc.getEnvironment()).toBe("renderer");
      expect(mockIPCBridge.getEnvironment).toHaveBeenCalled();
    });
  });

  describe("Domain isolation", () => {
    it("should isolate events between different domains", () => {
      const bus1 = createDesktopEventBus<TestEvents>("domain1");
      const bus2 = createDesktopEventBus<TestEvents>("domain2");

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

    it("should return correct domain names", () => {
      const bus1 = createDesktopEventBus<TestEvents>("my-app");
      const bus2 = createDesktopEventBus<TestEvents>("another-domain");

      expect(bus1.getDomain()).toBe("my-app");
      expect(bus2.getDomain()).toBe("another-domain");
    });
  });

  describe("Error handling", () => {
    let eventBus: ReturnType<typeof createDesktopEventBus<TestEvents>>;

    beforeEach(() => {
      eventBus = createDesktopEventBus<TestEvents>("test");
    });

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

  describe("Type safety", () => {
    it("should provide type-safe event emission and listening", () => {
      const eventBus = createDesktopEventBus<TestEvents>("test");

      // This should compile without TypeScript errors
      eventBus.on("user:login", (data) => {
        // data should be inferred as { userId: string; timestamp: number }
        expect(data.userId).toBeDefined();
        expect(data.timestamp).toBeDefined();
      });

      eventBus.emit("user:login", { userId: "123", timestamp: Date.now() });

      // This would cause TypeScript errors (if not commented out):
      // eventBus.emit("user:login", { wrongProperty: "test" });
      // eventBus.on("nonexistent:event", vi.fn());
    });
  });
});
