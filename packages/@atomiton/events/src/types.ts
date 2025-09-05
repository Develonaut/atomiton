/**
 * Event System Types
 */

/**
 * System event structure
 */
export interface SystemEvent<T = unknown> {
  type: string;
  source: string;
  timestamp: number;
  data?: T;
  metadata?: Record<string, unknown>;
}

/**
 * Event listener function
 */
export type SystemEventListener<T = unknown> = (
  event: SystemEvent<T>,
) => void | Promise<void>;

/**
 * Event subscription
 */
export interface EventSubscription {
  unsubscribe: () => void;
}

/**
 * Event filter for selective listening
 */
export interface EventFilter {
  type?: string | string[] | RegExp;
  source?: string | string[] | RegExp;
}

/**
 * Event emitter options
 */
export interface EventEmitterOptions {
  maxListeners?: number;
  errorHandler?: (error: Error, event: SystemEvent) => void;
  async?: boolean;
}
