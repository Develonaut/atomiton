import type { EventMap } from "#core/types";

// EventRegistry for managing event type definitions across the application
export type EventRegistry = {
  register<T extends EventMap>(domain: string, events: T): void;
  get<T extends EventMap>(domain: string): T | undefined;
  has(domain: string): boolean;
  list(): string[];
  clear(): void;
};

export function createEventRegistry(): EventRegistry {
  const registry = new Map<string, EventMap>();

  return {
    register<T extends EventMap>(domain: string, events: T): void {
      registry.set(domain, events);
    },

    get<T extends EventMap>(domain: string): T | undefined {
      return registry.get(domain) as T | undefined;
    },

    has(domain: string): boolean {
      return registry.has(domain);
    },

    list(): string[] {
      return Array.from(registry.keys());
    },

    clear(): void {
      registry.clear();
    },
  };
}

// Global singleton registry
export const globalEventRegistry = createEventRegistry();
