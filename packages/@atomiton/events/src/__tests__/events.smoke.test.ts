import { describe, it, expect } from "vitest";
import { createEvents } from "../testing";

type SmokeEvents = {
  test: { data: string };
  broadcast: { test: boolean };
  rapid: { index: number };
};

describe("Events Smoke Tests", () => {
  it("should emit and receive events without errors", () => {
    const events = createEvents<SmokeEvents>();
    let received = false;

    const unsubscribe = events.on("test", () => {
      received = true;
    });

    events.emit("test", { data: "test" });
    expect(received).toBe(true);
    unsubscribe();
  });

  it("should broadcast events successfully", () => {
    const events = createEvents<SmokeEvents>();
    let eventData: { test: boolean } | null = null;

    const unsubscribe = events.on("broadcast", (data) => {
      eventData = data;
    });

    events.emit("broadcast", { test: true });

    expect(eventData).toBeDefined();
    expect(eventData?.test).toBe(true);

    unsubscribe();
  });

  it("should handle high-frequency events", () => {
    const events = createEvents<SmokeEvents>();
    let count = 0;

    const unsubscribe = events.on("rapid", () => {
      count++;
    });

    // Emit 1000 events rapidly
    for (let i = 0; i < 1000; i++) {
      events.emit("rapid", { index: i });
    }

    expect(count).toBe(1000);
    unsubscribe();
  });

  it("should track listener counts accurately", () => {
    const events = createEvents<SmokeEvents>();

    expect(events.listenerCount("test")).toBe(0);

    const unsub1 = events.on("test", () => {});
    expect(events.listenerCount("test")).toBe(1);

    const unsub2 = events.on("test", () => {});
    expect(events.listenerCount("test")).toBe(2);

    unsub1();
    expect(events.listenerCount("test")).toBe(1);

    unsub2();
    expect(events.listenerCount("test")).toBe(0);
  });

  it("should clear all listeners properly", () => {
    const events = createEvents<SmokeEvents>();

    events.on("test", () => {});
    events.on("broadcast", () => {});

    expect(events.listenerCount("test")).toBe(1);
    expect(events.listenerCount("broadcast")).toBe(1);

    events.removeAllListeners();

    expect(events.listenerCount("test")).toBe(0);
    expect(events.listenerCount("broadcast")).toBe(0);
  });
});
