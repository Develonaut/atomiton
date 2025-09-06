/**
 * Tests for EventClient
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

import { EventClient, eventClient } from "../../clients/EventClient";
import type { SystemEvent } from "../../clients/EventClient";

describe("EventClient", () => {
  let client: EventClient;

  beforeEach(() => {
    client = new EventClient();
  });

  it("should broadcast and listen to events", async () => {
    const testEvent: SystemEvent = {
      type: "test",
      source: "test-suite",
      timestamp: Date.now(),
      data: { message: "Hello" },
    };

    const eventPromise = new Promise<SystemEvent>((resolve) => {
      client.listen((event) => resolve(event));
    });

    client.broadcast(testEvent);

    const receivedEvent = await eventPromise;
    expect(receivedEvent).toEqual(testEvent);
  });

  it("should handle multiple listeners", () => {
    const events: SystemEvent[] = [];

    client.listen((event) => events.push(event));
    client.listen((event) => events.push(event));

    const testEvent: SystemEvent = {
      type: "multi",
      source: "test",
      timestamp: Date.now(),
    };

    client.broadcast(testEvent);

    expect(events).toHaveLength(2);
    expect(events[0]).toEqual(testEvent);
    expect(events[1]).toEqual(testEvent);
  });

  it("should export singleton instance", () => {
    expect(eventClient).toBeInstanceOf(EventClient);
  });

  it("should handle events with missing optional data", () => {
    const events: SystemEvent[] = [];
    client.listen((event) => events.push(event));

    const minimalEvent: SystemEvent = {
      type: "minimal",
      source: "test",
      timestamp: Date.now(),
    };

    client.broadcast(minimalEvent);

    expect(events).toHaveLength(1);
    expect(events[0].data).toBeUndefined();
  });

  it("should handle many listeners without immediate crash", () => {
    const initialListenerCount = client.listenerCount("system");

    // Add multiple listeners - this tests that we don't hit the default 10 listener limit
    const listeners = Array.from({ length: 100 }, () => () => {});
    listeners.forEach((listener) => client.listen(listener));

    expect(client.listenerCount("system")).toBe(initialListenerCount + 100);

    // Note: This minimal implementation doesn't support listener removal
    // since we wrap listeners for error handling. For a production system,
    // we'd need a more sophisticated approach with listener tracking.
  });

  it("should handle rapid event broadcasting", () => {
    const events: SystemEvent[] = [];
    client.listen((event) => events.push(event));

    // Rapidly broadcast events
    for (let i = 0; i < 1000; i++) {
      client.broadcast({
        type: "rapid",
        source: "stress-test",
        timestamp: Date.now(),
        data: { index: i },
      });
    }

    expect(events).toHaveLength(1000);
    expect(events[999].data).toEqual({ index: 999 });
  });

  it("should safely handle listener errors without crashing", () => {
    const goodEvents: SystemEvent[] = [];
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Add a listener that throws
    client.listen(() => {
      throw new Error("Listener error");
    });

    // Add a good listener
    client.listen((event) => goodEvents.push(event));

    const testEvent: SystemEvent = {
      type: "error-test",
      source: "test",
      timestamp: Date.now(),
    };

    // Should not throw
    expect(() => client.broadcast(testEvent)).not.toThrow();

    // Should log the error
    expect(consoleSpy).toHaveBeenCalledWith(
      "EventClient: Listener error during event processing:",
      expect.any(Error),
    );

    // Good listener should still receive event
    expect(goodEvents).toHaveLength(1);

    consoleSpy.mockRestore();
  });
});
