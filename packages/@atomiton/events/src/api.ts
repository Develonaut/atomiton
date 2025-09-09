/**
 * Events API - Centralized API for the Events Package
 *
 * Provides a unified interface to all event functionality,
 * following the same pattern as @atomiton/nodes but using api.ts naming.
 *
 * Usage:
 *   import events from '@atomiton/events';
 *
 *   // Initialize the event system
 *   await events.initialize();
 *
 *   // Emit state change
 *   events.emitStateChange('blueprint', newState, oldState);
 *
 *   // Subscribe to UI actions
 *   const subscription = events.onUIAction((action, payload) => {
 *     console.log('UI Action:', action, payload);
 *   });
 */

import {
  emit,
  subscribe,
  subscribeFiltered,
  once,
  broadcast,
  createEvent,
  clearAllListeners,
  getListenerCount,
  getActiveChannels,
  configure,
  getConfig,
} from "./emitter";
import type { EventSubscription, EventEmitterOptions } from "./types";

class EventsAPI {
  private static instance: EventsAPI;
  private initialized = false;

  private constructor() {}

  static getInstance(): EventsAPI {
    if (!EventsAPI.instance) {
      EventsAPI.instance = new EventsAPI();
    }
    return EventsAPI.instance;
  }

  /**
   * Initialize the events system
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Events are automatically available
    this.initialized = true;
  }

  /**
   * Check if events system is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Configure the event emitter
   */
  configure(options: EventEmitterOptions): void {
    configure(options);
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return getConfig();
  }

  /**
   * Core event functions
   */
  emit = emit;
  subscribe = subscribe;
  subscribeFiltered = subscribeFiltered;
  once = once;
  broadcast = broadcast;
  createEvent = createEvent;
  clearAllListeners = clearAllListeners;
  getListenerCount = getListenerCount;
  getActiveChannels = getActiveChannels;

  /**
   * Create a typed event bus for a specific domain
   */
  createEventBus<T extends Record<string, unknown>>(domain: string) {
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
}

// Export singleton instance
const events = EventsAPI.getInstance();

export default events;
export { events };
export type { EventsAPI };
