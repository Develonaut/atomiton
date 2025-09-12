/**
 * IPC Support for Event System
 *
 * Provides Inter-Process Communication capabilities for Electron apps,
 * allowing seamless event communication between renderer and main processes.
 */

import type { SystemEvent, EventSubscription, IPCEventHandler } from "./types";

// Type definitions for Electron IPC interfaces
type IpcRenderer = {
  on: (
    channel: string,
    listener: (event: unknown, data: string) => void,
  ) => void;
  send: (channel: string, ...args: unknown[]) => void;
};

type IpcMain = {
  on: (
    channel: string,
    listener: (event: { sender: { id: number } }, data: string) => void,
  ) => void;
};

type WebContents = {
  id: number;
  send: (channel: string, ...args: unknown[]) => void;
};

type ElectronWebContents = {
  getAllWebContents: () => WebContents[];
};

// Type guards for Electron environment
export function isElectronRenderer(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof process !== "undefined" &&
    (process as unknown as { type: string }).type === "renderer"
  );
}

export function isElectronMain(): boolean {
  return (
    typeof window === "undefined" &&
    typeof process !== "undefined" &&
    (process as unknown as { type: string }).type === "browser"
  );
}

export function isElectron(): boolean {
  return isElectronRenderer() || isElectronMain();
}

/**
 * IPC Bridge - Handles cross-process event communication
 */
export class IPCBridge {
  private handlers = new Map<string, Set<IPCEventHandler>>();
  private ipcRenderer?: IpcRenderer;
  private ipcMain?: IpcMain;
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (this.initialized) return;

    try {
      if (isElectronRenderer()) {
        // Dynamic import to avoid errors in non-Electron environments
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const electron = require("electron") as { ipcRenderer: IpcRenderer };
        this.ipcRenderer = electron.ipcRenderer;
        this.setupRendererHandlers();
      } else if (isElectronMain()) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const electron = require("electron") as { ipcMain: IpcMain };
        this.ipcMain = electron.ipcMain;
        this.setupMainHandlers();
      }
      this.initialized = true;
    } catch {
      // Not in Electron environment, IPC features disabled
    }
  }

  private setupRendererHandlers(): void {
    if (!this.ipcRenderer) return;

    // Listen for events from main process
    this.ipcRenderer.on("events:broadcast", (_event: unknown, data: string) => {
      const systemEvent = this.deserialize(data);
      this.emit(systemEvent);
    });
  }

  private setupMainHandlers(): void {
    if (!this.ipcMain) return;

    // Listen for events from renderer processes
    this.ipcMain.on(
      "events:broadcast",
      (event: { sender: { id: number } }, data: string) => {
        const systemEvent = this.deserialize(data);

        // Broadcast to all renderer processes
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { webContents } = require("electron") as {
          webContents: ElectronWebContents;
        };
        webContents.getAllWebContents().forEach((contents) => {
          if (contents.id !== event.sender.id) {
            contents.send("events:broadcast", data);
          }
        });

        // Also emit locally in main process
        this.emit(systemEvent);
      },
    );
  }

  /**
   * Send event across IPC boundary
   */
  sendToOtherProcess(event: SystemEvent): void {
    if (!this.initialized) return;

    const serialized = this.serialize(event);

    if (this.ipcRenderer) {
      // Send from renderer to main
      this.ipcRenderer.send("events:broadcast", serialized);
    } else if (this.ipcMain) {
      // Send from main to all renderers
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { webContents } = require("electron") as {
        webContents: ElectronWebContents;
      };
      webContents.getAllWebContents().forEach((contents) => {
        contents.send("events:broadcast", serialized);
      });
    }
  }

  /**
   * Register handler for IPC events
   */
  on(channel: string, handler: IPCEventHandler): EventSubscription {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
    }
    this.handlers.get(channel)!.add(handler);

    return {
      unsubscribe: () => {
        const handlers = this.handlers.get(channel);
        if (handlers) {
          handlers.delete(handler);
          if (handlers.size === 0) {
            this.handlers.delete(channel);
          }
        }
      },
    };
  }

  /**
   * Emit event to local handlers
   */
  private emit(event: SystemEvent): void {
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error("IPC handler error:", error, "Event:", event);
        }
      });
    }

    // Also emit wildcard handlers
    const wildcardHandlers = this.handlers.get("*");
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error("IPC wildcard handler error:", error, "Event:", event);
        }
      });
    }
  }

  /**
   * Serialize event for IPC transport
   */
  private serialize(event: SystemEvent): string {
    return JSON.stringify(event, (key, value) => {
      // Handle special types that don't serialize well
      if (value instanceof Date) {
        return { __type: "Date", value: value.toISOString() };
      }
      if (value instanceof Error) {
        return {
          __type: "Error",
          message: value.message,
          stack: value.stack,
          name: value.name,
        };
      }
      if (value instanceof RegExp) {
        return {
          __type: "RegExp",
          source: value.source,
          flags: value.flags,
        };
      }
      if (typeof value === "undefined") {
        return { __type: "undefined" };
      }
      if (typeof value === "function") {
        // Functions can't be serialized across IPC
        return { __type: "function", name: value.name };
      }
      return value;
    });
  }

  /**
   * Deserialize event from IPC transport
   */
  private deserialize(data: string): SystemEvent {
    return JSON.parse(data, (key, value) => {
      if (value && typeof value === "object" && value.__type) {
        switch (value.__type) {
          case "Date":
            return new Date(value.value);
          case "Error": {
            const error = new Error(value.message);
            error.stack = value.stack;
            error.name = value.name;
            return error;
          }
          case "RegExp":
            return new RegExp(value.source, value.flags);
          case "undefined":
            return undefined;
          case "function":
            // Can't reconstruct functions, return placeholder
            return `[Function: ${value.name || "anonymous"}]`;
          default:
            return value;
        }
      }
      return value;
    });
  }

  /**
   * Check if IPC is available
   */
  isAvailable(): boolean {
    return this.initialized && (!!this.ipcRenderer || !!this.ipcMain);
  }

  /**
   * Get current process type
   */
  getProcessType(): "renderer" | "main" | "browser" | null {
    if (isElectronRenderer()) return "renderer";
    if (isElectronMain()) return "main";
    if (typeof window !== "undefined") return "browser";
    return null;
  }
}

// Export singleton instance
export const ipcBridge = new IPCBridge();
