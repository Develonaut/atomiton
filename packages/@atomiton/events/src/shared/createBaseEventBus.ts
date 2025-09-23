import type { EventBus, EventMap, EventBridge, EventMiddleware, MiddlewareFn, EnvironmentType, EventHandler } from '#core/types';
import type { EventContext } from '#shared/eventContext';
import { createEventName, createSafeListener } from '#core/utils';

export type BaseEventBusOptions = {
  domain: string;
  context: EventContext;
  enableBridge?: boolean;
  enableMiddleware?: boolean;
};

function createEmit<T extends EventMap = EventMap>(
  context: EventContext,
  middlewares: Array<MiddlewareFn<unknown>>
) {
  return function emit<K extends keyof T>(event: K, data: T[K]): void {
    const eventName = createEventName(context.domain, event);

    let processedData: unknown = data;
    if (middlewares.length > 0) {
      for (const fn of middlewares) {
        processedData = fn(String(event), processedData);
      }
    }

    context.emit(eventName, processedData);
  };
}

function createOn<T extends EventMap = EventMap>(context: EventContext) {
  return function on<K extends keyof T>(
    event: K,
    handler: (data: T[K]) => void,
  ) {
    const eventName = createEventName(context.domain, event);
    const listener = createSafeListener(handler, context.domain, String(event));

    context.listenerMap.set(handler as EventHandler<unknown>, listener);
    context.on(eventName, listener);

    return () => {
      context.off(eventName, listener);
      context.listenerMap.delete(handler as EventHandler<unknown>);
    };
  };
}

function createOnce<T extends EventMap = EventMap>(context: EventContext) {
  return function once<K extends keyof T>(
    event: K,
    handler: (data: T[K]) => void,
  ) {
    const eventName = createEventName(context.domain, event);
    const listener = createSafeListener(handler, context.domain, String(event));

    context.listenerMap.set(handler as EventHandler<unknown>, listener);
    context.once(eventName, listener);

    return () => {
      context.off(eventName, listener);
      context.listenerMap.delete(handler as EventHandler<unknown>);
    };
  };
}

function createOff<T extends EventMap = EventMap>(context: EventContext) {
  return function off<K extends keyof T>(
    event: K,
    handler: (data: T[K]) => void,
  ): void {
    const eventName = createEventName(context.domain, event);
    const mappedListener = context.listenerMap.get(handler as EventHandler<unknown>);
    if (mappedListener) {
      context.off(eventName, mappedListener);
      context.listenerMap.delete(handler as EventHandler<unknown>);
    }
  };
}

function createListenerCount<T extends EventMap = EventMap>(context: EventContext) {
  return function listenerCount<K extends keyof T>(event: K): number {
    const eventName = createEventName(context.domain, event);
    return context.listenerCount(eventName);
  };
}

export function createBaseEventBus<T extends EventMap = EventMap>(
  options: BaseEventBusOptions
): EventBus<T> {
  const { domain, context, enableBridge, enableMiddleware } = options;
  const forwarding = new Map<keyof T, Set<EnvironmentType>>();
  const middlewares: Array<MiddlewareFn<unknown>> = [];

  const bridge: EventBridge<T> | undefined = enableBridge ? {
    forward: (event, target) => {
      if (!forwarding.has(event)) {
        forwarding.set(event, new Set());
      }
      forwarding.get(event)!.add(target);
    },
    isForwarded: (event) => forwarding.has(event),
    stopForwarding: (event, target) => {
      if (target) {
        forwarding.get(event)?.delete(target);
        if (forwarding.get(event)?.size === 0) {
          forwarding.delete(event);
        }
      } else {
        forwarding.delete(event);
      }
    },
    getForwardingRules: () => new Map(forwarding)
  } : undefined;

  const middleware: EventMiddleware | undefined = enableMiddleware ? {
    use: (fn) => middlewares.push(fn as MiddlewareFn<unknown>),
    remove: (fn) => {
      const index = middlewares.indexOf(fn as MiddlewareFn<unknown>);
      if (index !== -1) middlewares.splice(index, 1);
    },
    clear: () => middlewares.length = 0
  } : undefined;

  return {
    emit: createEmit<T>(context, middlewares),
    on: createOn<T>(context),
    once: createOnce<T>(context),
    off: createOff<T>(context),
    removeAllListeners: () => context.removeAllListeners(),
    listenerCount: createListenerCount<T>(context),
    getDomain: () => domain,
    bridge,
    middleware
  };
}