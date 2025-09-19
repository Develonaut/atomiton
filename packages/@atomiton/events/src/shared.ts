import type { EventBus } from "./types";
import { createSafeListener, createEventName } from "./utils";

export type EventContext = {
  emit(eventName: string, data: unknown): void;
  on(eventName: string, listener: (...args: unknown[]) => void): void;
  once(eventName: string, listener: (...args: unknown[]) => void): void;
  off(eventName: string, listener: (...args: unknown[]) => void): void;
  removeAllListeners(): void;
  listenerCount(eventName: string): number;
  listenerMap: WeakMap<(data: unknown) => void, (...args: unknown[]) => void>;
  domain: string;
};

export function createEmit<T extends Record<string, unknown>>(
  ctx: EventContext,
) {
  return function emit<K extends keyof T>(event: K, data: T[K]): void {
    const eventName = createEventName(ctx.domain, event);
    ctx.emit(eventName, data);
  };
}

export function createOn<T extends Record<string, unknown>>(ctx: EventContext) {
  return function on<K extends keyof T>(
    event: K,
    handler: (data: T[K]) => void,
  ) {
    const eventName = createEventName(ctx.domain, event);
    const listener = createSafeListener(handler, ctx.domain, String(event));

    ctx.listenerMap.set(handler as (data: unknown) => void, listener);
    ctx.on(eventName, listener);

    return () => {
      ctx.off(eventName, listener);
      ctx.listenerMap.delete(handler as (data: unknown) => void);
    };
  };
}

export function createOnce<T extends Record<string, unknown>>(
  ctx: EventContext,
) {
  return function once<K extends keyof T>(
    event: K,
    handler: (data: T[K]) => void,
  ) {
    const eventName = createEventName(ctx.domain, event);
    const listener = createSafeListener(handler, ctx.domain, String(event));

    ctx.listenerMap.set(handler as (data: unknown) => void, listener);
    ctx.once(eventName, listener);

    return () => {
      ctx.off(eventName, listener);
      ctx.listenerMap.delete(handler as (data: unknown) => void);
    };
  };
}

export function createOff<T extends Record<string, unknown>>(
  ctx: EventContext,
) {
  return function off<K extends keyof T>(
    event: K,
    handler: (data: T[K]) => void,
  ): void {
    const eventName = createEventName(ctx.domain, event);
    const mappedListener = ctx.listenerMap.get(
      handler as (data: unknown) => void,
    );
    if (mappedListener) {
      ctx.off(eventName, mappedListener);
      ctx.listenerMap.delete(handler as (data: unknown) => void);
    }
  };
}

export function createListenerCount<T extends Record<string, unknown>>(
  ctx: EventContext,
) {
  return function listenerCount<K extends keyof T>(event: K): number {
    const eventName = createEventName(ctx.domain, event);
    return ctx.listenerCount(eventName);
  };
}

export function createEventBusImpl<T extends Record<string, unknown>>(
  ctx: EventContext,
): EventBus<T> {
  return {
    emit: createEmit<T>(ctx),
    on: createOn<T>(ctx),
    once: createOnce<T>(ctx),
    off: createOff<T>(ctx),
    removeAllListeners: () => ctx.removeAllListeners(),
    listenerCount: createListenerCount<T>(ctx),
    getDomain: () => ctx.domain,
  };
}
