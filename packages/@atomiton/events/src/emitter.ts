/**
 * Event Emitter - Core event broadcasting functionality
 * Pure functional implementation without classes
 */

import { EventEmitter } from "events";
import type {
  SystemEvent,
  SystemEventListener,
  EventSubscription,
  EventFilter,
  EventEmitterOptions,
} from "./types";

// ============================================================================
// Private State
// ============================================================================

// Core event emitter instance
const emitter = new EventEmitter();

// Configuration
let config: Required<EventEmitterOptions> = {
  maxListeners: 1000,
  errorHandler: (error, event) => {
    console.error("Event listener error:", error, "Event:", event);
  },
  async: false,
};

// Listener tracking for better debugging
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listenerMap = new Map<string, Set<SystemEventListener<any>>>();

// Initialize on module load
emitter.setMaxListeners(config.maxListeners);

// ============================================================================
// Configuration
// ============================================================================

/**
 * Configure the event emitter
 */
export function configure(options: EventEmitterOptions): void {
  config = { ...config, ...options };
  emitter.setMaxListeners(config.maxListeners);
}

/**
 * Get current configuration
 */
export function getConfig(): Required<EventEmitterOptions> {
  return { ...config };
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Emit an event to all listeners
 */
export function emit<T = unknown>(event: SystemEvent<T>): void {
  // Ensure timestamp is set
  const eventWithTimestamp: SystemEvent<T> = {
    ...event,
    timestamp: event.timestamp || Date.now(),
  };

  if (config.async) {
    setImmediate(() => emitter.emit("system", eventWithTimestamp));
  } else {
    emitter.emit("system", eventWithTimestamp);
  }

  // Also emit typed events for filtered listening
  emitter.emit(`type:${event.type}`, eventWithTimestamp);
  emitter.emit(`source:${event.source}`, eventWithTimestamp);
}

/**
 * Subscribe to all events
 */
export function subscribe<T = unknown>(
  listener: SystemEventListener<T>,
): EventSubscription {
  const wrappedListener = createWrappedListener(listener);

  emitter.on("system", wrappedListener);
  trackListener("system", listener);

  return {
    unsubscribe: () => {
      emitter.off("system", wrappedListener);
      untrackListener("system", listener);
    },
  };
}

/**
 * Subscribe to events with a filter
 */
export function subscribeFiltered<T = unknown>(
  filter: EventFilter,
  listener: SystemEventListener<T>,
): EventSubscription {
  const wrappedListener = createFilteredListener(filter, listener);

  emitter.on("system", wrappedListener);
  trackListener("filtered", listener);

  return {
    unsubscribe: () => {
      emitter.off("system", wrappedListener);
      untrackListener("filtered", listener);
    },
  };
}

/**
 * Subscribe to events once (auto-unsubscribe after first event)
 */
export function once<T = unknown>(
  listener: SystemEventListener<T>,
): EventSubscription {
  const wrappedListener = createWrappedListener(listener);

  emitter.once("system", wrappedListener);
  trackListener("once", listener);

  return {
    unsubscribe: () => {
      emitter.off("system", wrappedListener);
      untrackListener("once", listener);
    },
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create an event
 */
export function createEvent<T = unknown>(
  type: string,
  source: string,
  data?: T,
  metadata?: Record<string, unknown>,
): SystemEvent<T> {
  return {
    type,
    source,
    timestamp: Date.now(),
    data,
    metadata,
  };
}

/**
 * Broadcast an event (convenience function)
 */
export function broadcast<T = unknown>(
  type: string,
  source: string,
  data?: T,
  metadata?: Record<string, unknown>,
): void {
  emit(createEvent(type, source, data, metadata));
}

/**
 * Clear all listeners
 */
export function clearAllListeners(): void {
  emitter.removeAllListeners();
  listenerMap.clear();
}

/**
 * Get listener count
 */
export function getListenerCount(event: string = "system"): number {
  return emitter.listenerCount(event);
}

/**
 * Get all active listener channels
 */
export function getActiveChannels(): string[] {
  return Array.from(listenerMap.keys());
}

// ============================================================================
// Private Helper Functions
// ============================================================================

function createWrappedListener<T>(
  listener: SystemEventListener<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): (...args: any[]) => void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (...args: any[]) => {
    const event = args[0] as SystemEvent<T>;
    try {
      await listener(event);
    } catch (error) {
      config.errorHandler(error as Error, event);
    }
  };
}

function createFilteredListener<T>(
  filter: EventFilter,
  listener: SystemEventListener<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): (...args: any[]) => void {
  return createWrappedListener((event: SystemEvent<T>) => {
    if (matchesFilter(event, filter)) {
      return listener(event);
    }
  });
}

function matchesFilter(event: SystemEvent, filter: EventFilter): boolean {
  // Check type filter
  if (filter.type) {
    if (!matchesPattern(event.type, filter.type)) {
      return false;
    }
  }

  // Check source filter
  if (filter.source) {
    if (!matchesPattern(event.source, filter.source)) {
      return false;
    }
  }

  return true;
}

function matchesPattern(
  value: string,
  pattern: string | string[] | RegExp,
): boolean {
  if (typeof pattern === "string") {
    return value === pattern;
  }

  if (Array.isArray(pattern)) {
    return pattern.includes(value);
  }

  if (pattern instanceof RegExp) {
    return pattern.test(value);
  }

  return false;
}

function trackListener(
  channel: string,
  listener: SystemEventListener<unknown>,
): void {
  if (!listenerMap.has(channel)) {
    listenerMap.set(channel, new Set());
  }
  listenerMap.get(channel)!.add(listener);
}

function untrackListener(
  channel: string,
  listener: SystemEventListener<unknown>,
): void {
  const listeners = listenerMap.get(channel);
  if (listeners) {
    listeners.delete(listener);
    if (listeners.size === 0) {
      listenerMap.delete(channel);
    }
  }
}
