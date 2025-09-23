import type { EventBus, EventMap, IPCBridge } from '#core/types';
import type { AutoForwardConfig } from '#desktop/bus';

export function setupAutoForwarding<T extends EventMap>(
  bus: EventBus<T>,
  ipc: IPCBridge,
  config: AutoForwardConfig
): () => void {
  const cleanupFns: Array<() => void> = [];

  if (!ipc.isAvailable()) {
    console.warn('IPC not available, auto-forwarding disabled');
    return () => {};
  }

  const environment = ipc.getEnvironment();

  // Forward events TO browser (from main process)
  if (config.toBrowser && environment === 'main') {
    for (const event of config.toBrowser) {
      // Listen to local events and forward to browser
      const unsubscribe = bus.on(event as keyof T, (data: T[keyof T]) => {
        const channel = `${bus.getDomain()}:${event}`;
        ipc.send(channel, data);
      });
      cleanupFns.push(unsubscribe);

      // Mark event as forwarded if bridge is available
      if (bus.bridge) {
        bus.bridge.forward(event as keyof T, 'browser');
      }
    }
  }

  // Forward events FROM browser (in renderer process)
  if (config.fromBrowser && environment === 'renderer') {
    for (const event of config.fromBrowser) {
      // Listen for IPC events and emit locally
      const ipcCleanup = ipc.on(`${bus.getDomain()}:${event}`, (ipcEvent) => {
        bus.emit(event as keyof T, ipcEvent.data as T[keyof T]);
      });
      cleanupFns.push(ipcCleanup);

      // Mark event as forwarded if bridge is available
      if (bus.bridge) {
        bus.bridge.forward(event as keyof T, 'desktop');
      }
    }
  }


  return () => {
    for (const cleanup of cleanupFns) {
      cleanup();
    }

    // Stop forwarding if bridge is available
    if (bus.bridge) {
      if (config.toBrowser) {
        for (const event of config.toBrowser) {
          bus.bridge.stopForwarding(event as keyof T, 'browser');
        }
      }
      if (config.fromBrowser) {
        for (const event of config.fromBrowser) {
          bus.bridge.stopForwarding(event as keyof T, 'desktop');
        }
      }
    }
  };
}

// Alternative API for auto-forwarding with more control
export type AutoForwarder = {
  start(): void;
  stop(): void;
  isActive(): boolean;
  addEvent(event: string, direction: 'toBrowser' | 'fromBrowser'): void;
  removeEvent(event: string, direction: 'toBrowser' | 'fromBrowser'): void;
};

export function createAutoForwarder<T extends EventMap>(
  bus: EventBus<T>,
  ipc: IPCBridge
): AutoForwarder {
  let isActive = false;
  let cleanup: (() => void) | null = null;
  const config: AutoForwardConfig = {
    toBrowser: [],
    fromBrowser: []
  };

  return {
    start(): void {
      if (!isActive) {
        cleanup = setupAutoForwarding(bus, ipc, config);
        isActive = true;
      }
    },

    stop(): void {
      if (isActive && cleanup) {
        cleanup();
        cleanup = null;
        isActive = false;
      }
    },

    isActive(): boolean {
      return isActive;
    },

    addEvent(event: string, direction: 'toBrowser' | 'fromBrowser'): void {
      const list = direction === 'toBrowser' ? config.toBrowser : config.fromBrowser;
      if (list && !list.includes(event)) {
        list.push(event);
        // Restart if active to apply changes
        if (isActive) {
          this.stop();
          this.start();
        }
      }
    },

    removeEvent(event: string, direction: 'toBrowser' | 'fromBrowser'): void {
      const list = direction === 'toBrowser' ? config.toBrowser : config.fromBrowser;
      if (list) {
        const index = list.indexOf(event);
        if (index !== -1) {
          list.splice(index, 1);
          // Restart if active to apply changes
          if (isActive) {
            this.stop();
            this.start();
          }
        }
      }
    }
  };
}