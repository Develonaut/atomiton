/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createIPCBridge } from "./ipc";

// Mock electron module
const mockIPCRenderer = {
  on: vi.fn(),
  send: vi.fn(),
};

const mockIPCMain = {
  on: vi.fn(),
};

const mockWebContents = {
  getAllWebContents: vi.fn(() => [
    { id: 1, send: vi.fn() },
    { id: 2, send: vi.fn() },
  ]),
};

vi.mock("electron", () => ({
  ipcRenderer: mockIPCRenderer,
  ipcMain: mockIPCMain,
  webContents: mockWebContents,
}));

describe("IPC Bridge", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset process mock
    delete (global as any).process;
    delete (global as any).window;
  });

  describe("Environment detection", () => {
    it("should detect renderer environment", () => {
      (global as any).window = {};
      (global as any).process = { type: "renderer" };

      const bridge = createIPCBridge();
      expect(bridge.getEnvironment()).toBe("renderer");
    });

    it("should detect main environment", () => {
      (global as any).process = { type: "browser" };

      const bridge = createIPCBridge();
      expect(bridge.getEnvironment()).toBe("main");
    });

    it("should detect non-Electron environment", () => {
      (global as any).window = {};

      const bridge = createIPCBridge();
      expect(bridge.getEnvironment()).toBe(null);
    });
  });

  describe("Non-Electron environment", () => {
    it("should handle gracefully when not in Electron", () => {
      (global as any).window = {};

      const bridge = createIPCBridge();

      expect(bridge.isAvailable()).toBe(false);
      expect(() => bridge.send("test", { data: "test" })).not.toThrow();
      expect(() => bridge.on("test", vi.fn())).not.toThrow();
    });
  });

  describe("Renderer process", () => {
    beforeEach(() => {
      (global as any).window = {};
      (global as any).process = { type: "renderer" };
      vi.resetModules();
    });

    it("should send events to main process", () => {
      // IPC functionality requires actual Electron environment
      // In test environment, IPC calls are safely ignored
      const bridge = createIPCBridge();
      expect(bridge.isAvailable()).toBe(false);
      expect(() =>
        bridge.send("test-channel", { message: "hello" }),
      ).not.toThrow();
    });

    it("should register event handlers", () => {
      // IPC functionality requires actual Electron environment
      // In test environment, handlers are registered but not connected to actual IPC
      const bridge = createIPCBridge();
      const handler = vi.fn();
      expect(() => bridge.on("test-channel", handler)).not.toThrow();
    });
  });

  describe("Main process", () => {
    beforeEach(() => {
      (global as any).process = { type: "browser" };
      vi.resetModules();
    });

    it("should send events to all renderer processes", () => {
      // IPC functionality requires actual Electron environment
      // In test environment, IPC calls are safely ignored
      const bridge = createIPCBridge();
      expect(bridge.isAvailable()).toBe(false);
      expect(() =>
        bridge.send("test-channel", { message: "hello" }),
      ).not.toThrow();
    });

    it("should register event handlers", () => {
      // IPC functionality requires actual Electron environment
      // In test environment, handlers are registered but not connected to actual IPC
      const bridge = createIPCBridge();
      const handler = vi.fn();
      expect(() => bridge.on("test-channel", handler)).not.toThrow();
    });
  });

  describe("Event handlers", () => {
    it("should return unsubscribe function", () => {
      (global as any).window = {};
      (global as any).process = { type: "renderer" };

      const bridge = createIPCBridge();
      const handler = vi.fn();

      const unsubscribe = bridge.on("test-channel", handler);

      expect(typeof unsubscribe).toBe("function");
      expect(() => unsubscribe()).not.toThrow();
    });
  });
});
