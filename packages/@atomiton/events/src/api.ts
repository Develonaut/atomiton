/**
 * Events API - High-level functional API for event system
 * Domain-specific event functions
 */

import { subscribeFiltered, broadcast } from "./emitter";
import type { EventSubscription } from "./types";

// ============================================================================
// Application Events
// ============================================================================

/**
 * Emit a state change event
 */
export function emitStateChange(
  storeName: string,
  state: unknown,
  previousState?: unknown,
): void {
  broadcast("state:change", storeName, {
    current: state,
    previous: previousState,
  });
}

/**
 * Subscribe to state changes
 */
export function onStateChange(
  callback: (
    storeName: string,
    state: unknown,
    previousState?: unknown,
  ) => void,
): EventSubscription {
  return subscribeFiltered({ type: "state:change" }, (event) => {
    const data = event.data as { current: unknown; previous?: unknown };
    callback(event.source, data.current, data.previous);
  });
}

// ============================================================================
// UI Events
// ============================================================================

/**
 * Emit a UI action event
 */
export function emitUIAction(action: string, payload?: unknown): void {
  broadcast("ui:action", "ui", { action, payload });
}

/**
 * Subscribe to UI actions
 */
export function onUIAction(
  callback: (action: string, payload?: unknown) => void,
): EventSubscription {
  return subscribeFiltered({ type: "ui:action" }, (event) => {
    const data = event.data as { action: string; payload?: unknown };
    callback(data.action, data.payload);
  });
}

// ============================================================================
// Blueprint Events
// ============================================================================

/**
 * Emit a blueprint execution event
 */
export function emitBlueprintExecution(
  blueprintId: string,
  status: "started" | "completed" | "failed",
  details?: unknown,
): void {
  broadcast("blueprint:execution", blueprintId, {
    status,
    details,
    timestamp: Date.now(),
  });
}

/**
 * Subscribe to blueprint execution events
 */
export function onBlueprintExecution(
  callback: (
    blueprintId: string,
    status: "started" | "completed" | "failed",
    details?: unknown,
  ) => void,
): EventSubscription {
  return subscribeFiltered({ type: "blueprint:execution" }, (event) => {
    const data = event.data as {
      status: "started" | "completed" | "failed";
      details?: unknown;
    };
    callback(event.source, data.status, data.details);
  });
}

// ============================================================================
// Node Events
// ============================================================================

/**
 * Emit a node event
 */
export function emitNodeEvent(
  nodeId: string,
  eventType: "executed" | "error" | "warning" | "info",
  message?: string,
  data?: unknown,
): void {
  broadcast(`node:${eventType}`, nodeId, { message, data });
}

/**
 * Subscribe to node events
 */
export function onNodeEvent(
  eventType: "executed" | "error" | "warning" | "info",
  callback: (nodeId: string, message?: string, data?: unknown) => void,
): EventSubscription {
  return subscribeFiltered({ type: `node:${eventType}` }, (event) => {
    const data = event.data as { message?: string; data?: unknown };
    callback(event.source, data.message, data.data);
  });
}

// ============================================================================
// System Events
// ============================================================================

/**
 * Emit a system event
 */
export function emitSystemEvent(
  eventType: "ready" | "shutdown" | "error" | "warning",
  details?: unknown,
): void {
  broadcast(`system:${eventType}`, "system", details);
}

/**
 * Subscribe to system events
 */
export function onSystemEvent(
  eventType: "ready" | "shutdown" | "error" | "warning",
  callback: (details?: unknown) => void,
): EventSubscription {
  return subscribeFiltered({ type: `system:${eventType}` }, (event) =>
    callback(event.data),
  );
}

// ============================================================================
// Performance Events
// ============================================================================

/**
 * Emit a performance metric
 */
export function emitMetric(
  metric: string,
  value: number,
  unit?: string,
  tags?: Record<string, string>,
): void {
  broadcast("metric", metric, { value, unit, tags });
}

/**
 * Subscribe to performance metrics
 */
export function onMetric(
  callback: (
    metric: string,
    value: number,
    unit?: string,
    tags?: Record<string, string>,
  ) => void,
): EventSubscription {
  return subscribeFiltered({ type: "metric" }, (event) => {
    const data = event.data as {
      value: number;
      unit?: string;
      tags?: Record<string, string>;
    };
    callback(event.source, data.value, data.unit, data.tags);
  });
}

// ============================================================================
// Debug Events
// ============================================================================

/**
 * Emit a debug event
 */
export function debug(source: string, message: string, data?: unknown): void {
  if (process.env.NODE_ENV === "development") {
    broadcast("debug", source, { message, data });
  }
}

/**
 * Subscribe to debug events
 */
export function onDebug(
  callback: (source: string, message: string, data?: unknown) => void,
): EventSubscription {
  return subscribeFiltered({ type: "debug" }, (event) => {
    const data = event.data as { message: string; data?: unknown };
    callback(event.source, data.message, data.data);
  });
}

// ============================================================================
// Event Bus Pattern
// ============================================================================

/**
 * Create a typed event bus for a specific domain
 */
export function createEventBus<T extends Record<string, unknown>>(
  domain: string,
) {
  return {
    emit: <K extends keyof T>(eventType: K, data: T[K]) => {
      broadcast(`${domain}:${String(eventType)}`, domain, data);
    },

    on: <K extends keyof T>(
      eventType: K,
      callback: (data: T[K]) => void,
    ): EventSubscription => {
      return subscribeFiltered(
        { type: `${domain}:${String(eventType)}` },
        (event) => callback(event.data as T[K]),
      );
    },

    once: <K extends keyof T>(
      eventType: K,
      callback: (data: T[K]) => void,
    ): EventSubscription => {
      const subscription = subscribeFiltered(
        { type: `${domain}:${String(eventType)}` },
        (event) => {
          callback(event.data as T[K]);
          subscription.unsubscribe();
        },
      );
      return subscription;
    },
  };
}
