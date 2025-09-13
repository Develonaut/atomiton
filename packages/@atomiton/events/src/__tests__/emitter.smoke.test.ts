import { describe, it, expect, beforeEach } from "vitest";
import {
  emit,
  subscribe,
  broadcast,
  clearAllListeners,
  getListenerCount,
  createEvent,
  configure,
  getConfig,
} from "../emitter";
import type { SystemEvent } from "../types";

describe("Events System Smoke Tests", () => {
  beforeEach(() => {
    clearAllListeners();
  });

  it("should emit and receive events without errors", () => {
    let received = false;
    const subscription = subscribe(() => {
      received = true;
    });

    const event: SystemEvent = {
      type: "test",
      source: "smoke-test",
      timestamp: Date.now(),
    };

    emit(event);
    expect(received).toBe(true);
    subscription.unsubscribe();
  });

  it("should broadcast events successfully", () => {
    let eventReceived: SystemEvent | null = null;
    const subscription = subscribe((event) => {
      eventReceived = event;
    });

    broadcast("smoke-broadcast", "test-source", { test: true });

    expect(eventReceived).toBeDefined();
    expect(eventReceived?.type).toBe("smoke-broadcast");
    expect(eventReceived?.source).toBe("test-source");
    expect(eventReceived?.data).toEqual({ test: true });

    subscription.unsubscribe();
  });

  it("should create events with proper structure", () => {
    const event = createEvent("test-type", "test-source", { data: "test" });

    expect(event.type).toBe("test-type");
    expect(event.source).toBe("test-source");
    expect(event.data).toEqual({ data: "test" });
    expect(typeof event.timestamp).toBe("number");
    expect(event.timestamp).toBeGreaterThan(0);
  });

  it("should handle configuration changes", () => {
    const originalConfig = getConfig();

    configure({
      maxListeners: 500,
      async: true,
    });

    const newConfig = getConfig();
    expect(newConfig.maxListeners).toBe(500);
    expect(newConfig.async).toBe(true);

    // Restore original config
    configure(originalConfig);
  });

  it("should track listener counts accurately", () => {
    expect(getListenerCount()).toBe(0);

    const sub1 = subscribe(() => {});
    expect(getListenerCount()).toBe(1);

    const sub2 = subscribe(() => {});
    expect(getListenerCount()).toBe(2);

    sub1.unsubscribe();
    expect(getListenerCount()).toBe(1);

    sub2.unsubscribe();
    expect(getListenerCount()).toBe(0);
  });

  it("should clear all listeners properly", () => {
    subscribe(() => {});
    subscribe(() => {});

    expect(getListenerCount()).toBeGreaterThan(0);

    clearAllListeners();

    expect(getListenerCount()).toBe(0);
  });
});
