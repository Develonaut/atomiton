import { describe, it, expect } from "vitest";
import { createEventBus } from "../exports/browser";

type SmokeEvents = {
  test: { data: string };
  broadcast: { test: boolean };
  rapid: { index: number };
};

describe("EventBus Smoke Tests", () => {
  it("should emit and receive events without errors", () => {
    const eventBus = createEventBus<SmokeEvents>("smoke");
    let received = false;

    const unsubscribe = eventBus.on("test", () => {
      received = true;
    });

    eventBus.emit("test", { data: "test" });
    expect(received).toBe(true);
    unsubscribe();
  });

  it("should broadcast events successfully", () => {
    const eventBus = createEventBus<SmokeEvents>("smoke");
    let eventData: { test: boolean } | null = null;

    const unsubscribe = eventBus.on("broadcast", (data) => {
      eventData = data;
    });

    eventBus.emit("broadcast", { test: true });

    expect(eventData).toBeDefined();
    expect(eventData?.test).toBe(true);

    unsubscribe();
  });

  it("should handle high-frequency events", () => {
    const eventBus = createEventBus<SmokeEvents>("smoke");
    let count = 0;

    const unsubscribe = eventBus.on("rapid", () => {
      count++;
    });

    // Emit 1000 events rapidly
    for (let i = 0; i < 1000; i++) {
      eventBus.emit("rapid", { index: i });
    }

    expect(count).toBe(1000);
    unsubscribe();
  });

  it("should track listener counts accurately", () => {
    const eventBus = createEventBus<SmokeEvents>("smoke");

    expect(eventBus.listenerCount("test")).toBe(0);

    const unsub1 = eventBus.on("test", () => {});
    expect(eventBus.listenerCount("test")).toBe(1);

    const unsub2 = eventBus.on("test", () => {});
    expect(eventBus.listenerCount("test")).toBe(2);

    unsub1();
    expect(eventBus.listenerCount("test")).toBe(1);

    unsub2();
    expect(eventBus.listenerCount("test")).toBe(0);
  });

  it("should clear all listeners properly", () => {
    const eventBus = createEventBus<SmokeEvents>("smoke");

    eventBus.on("test", () => {});
    eventBus.on("broadcast", () => {});

    expect(eventBus.listenerCount("test")).toBe(1);
    expect(eventBus.listenerCount("broadcast")).toBe(1);

    eventBus.removeAllListeners();

    expect(eventBus.listenerCount("test")).toBe(0);
    expect(eventBus.listenerCount("broadcast")).toBe(0);
  });

  it("should return correct domain", () => {
    const eventBus = createEventBus<SmokeEvents>("test-domain");
    expect(eventBus.getDomain()).toBe("test-domain");
  });
});
