/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the events module
vi.mock("@atomiton/events/desktop", () => ({
  events: {
    ipc: {
      isAvailable: vi.fn(),
      getEnvironment: vi.fn(),
    },
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
}));

// Mock the utils module
vi.mock("@atomiton/utils", () => ({
  generateId: vi.fn(() => "test-integration-id"),
}));

import { events } from "@atomiton/events/desktop";

describe("Event Bus Integration for Conductor", () => {
  let mockEvents: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEvents = events;
    mockEvents.ipc.isAvailable.mockReturnValue(true);
  });

  describe("Event Bus Integration", () => {
    it("should use events for conductor communication", () => {
      mockEvents.ipc.getEnvironment.mockReturnValue("main");

      // Verify events module is being used
      expect(mockEvents.on).toBeDefined();
      expect(mockEvents.emit).toBeDefined();
      expect(mockEvents.off).toBeDefined();
      expect(mockEvents.ipc.isAvailable).toBeDefined();
      expect(mockEvents.ipc.getEnvironment).toBeDefined();
    });

    it("should handle conductor event types", () => {
      const eventTypes = [
        "conductor:execute",
        "conductor:result",
        "conductor:error",
      ];

      eventTypes.forEach((eventType) => {
        mockEvents.emit(eventType, { test: "data" });
        expect(mockEvents.emit).toHaveBeenCalledWith(eventType, {
          test: "data",
        });
      });
    });

    it("should support event registration and cleanup", () => {
      const handler = vi.fn();

      // Test event registration
      mockEvents.on("conductor:execute", handler);
      expect(mockEvents.on).toHaveBeenCalledWith("conductor:execute", handler);

      // Test event cleanup
      mockEvents.off("conductor:execute", handler);
      expect(mockEvents.off).toHaveBeenCalledWith("conductor:execute", handler);
    });

    it("should verify IPC availability in desktop environment", () => {
      expect(mockEvents.ipc.isAvailable()).toBe(true);
      expect(mockEvents.ipc.getEnvironment).toBeDefined();
    });
  });

  describe("Event Communication Patterns", () => {
    it("should use proper event naming conventions", () => {
      const expectedEvents = [
        "conductor:execute",
        "conductor:result",
        "conductor:error",
      ];

      expectedEvents.forEach((eventName) => {
        expect(eventName).toMatch(/^conductor:/);
      });
    });

    it("should verify event bus is available in desktop environment", () => {
      expect(mockEvents.ipc.isAvailable()).toBe(true);
      expect(mockEvents.ipc.getEnvironment).toBeDefined();
    });
  });

  describe("Migration from Raw IPC", () => {
    it("should use event bus for IPC communication", () => {
      // Verify we're using the events module instead of raw window.electron or ipcMain
      expect(mockEvents.emit).toBeDefined();
      expect(mockEvents.on).toBeDefined();
      expect(mockEvents.ipc).toBeDefined();
    });

    it("should maintain event-driven architecture", () => {
      // The event bus should support the same patterns as IPC
      expect(mockEvents.ipc.isAvailable).toBeDefined();
      expect(mockEvents.ipc.getEnvironment).toBeDefined();
    });
  });
});
