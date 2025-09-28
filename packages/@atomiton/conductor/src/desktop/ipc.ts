/**
 * IPC internals for conductor desktop implementation
 * Handles IPC channel definitions and utilities
 */

import type { IpcMain } from "electron";

/**
 * IPC Channel definitions - internal to conductor
 */
export const CONDUCTOR_CHANNELS = {
  NODE_RUN: "conductor:node:run",
  SYSTEM_HEALTH: "conductor:system:health",
} as const;

/**
 * Type definitions for IPC payloads
 */
export type NodeRunPayload = {
  node: {
    id?: string;
    type?: string;
    [key: string]: any;
  };
  context?: {
    executionId?: string;
    [key: string]: any;
  };
};

export type HealthCheckResponse = {
  status: "ok" | "error";
  timestamp: number;
  message?: string;
};

/**
 * Logging helper for consistent IPC logging
 */
export function logIPC(context: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${context}] ${message}:`, { ...data, timestamp });
}

export function logIPCError(
  context: string,
  message: string,
  error: unknown,
  data?: any,
) {
  const timestamp = new Date().toISOString();
  console.error(`[${context}] ${message}:`, {
    ...data,
    error: error instanceof Error ? error.message : String(error),
    timestamp,
  });
}

/**
 * Helper to register handlers in main process
 */
export function registerHandlers(
  ipcMain: IpcMain,
  handlers: Record<string, Function>,
): void {
  Object.entries(handlers).forEach(([channel, handler]) => {
    console.log(`[CONDUCTOR] Registering handler: ${channel}`);
    ipcMain.handle(channel, handler as any);
  });
}
