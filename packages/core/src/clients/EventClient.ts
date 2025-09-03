/**
 * Simple event client for system-wide event broadcasting
 */

import { EventEmitter } from "events";

export interface SystemEvent {
  type: string;
  source: string;
  timestamp: number;
  data?: unknown;
}

export class EventClient extends EventEmitter {
  constructor() {
    super();
    // Prevent memory leak warnings for systems with many listeners
    this.setMaxListeners(1000);
  }

  broadcast(event: SystemEvent): void {
    super.emit("system", event);
  }

  listen(listener: (event: SystemEvent) => void): void {
    // Wrap listener to handle errors gracefully
    const wrappedListener = (event: SystemEvent): void => {
      try {
        listener(event);
      } catch (error) {
        // Log error but don't crash - one bad listener shouldn't break the system
        console.error(
          "EventClient: Listener error during event processing:",
          error,
        );
      }
    };

    super.on("system", wrappedListener);
  }
}

// Export as module constant
export const eventClient = new EventClient();
