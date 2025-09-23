import type { IPCBridge, IPCEvent } from "#core/types";

export type BrowserIPCConfig = {
  targetOrigin?: string;
  allowedOrigins?: string[];
};

export function createBrowserIPCBridge(config?: BrowserIPCConfig): IPCBridge {
  const { targetOrigin = "*", allowedOrigins = [] } = config ?? {};
  const handlers = new Map<string, Set<(event: IPCEvent) => void>>();

  const isBrowser =
    typeof window !== "undefined" && typeof window.postMessage === "function";

  if (isBrowser) {
    window.addEventListener("message", (event) => {
      // Security check for allowed origins
      if (allowedOrigins.length > 0 && !allowedOrigins.includes(event.origin)) {
        return;
      }

      if (
        event.data &&
        typeof event.data === "object" &&
        "channel" in event.data
      ) {
        const channelHandlers = handlers.get(event.data.channel);
        if (channelHandlers) {
          const ipcEvent: IPCEvent = {
            channel: event.data.channel,
            data: event.data.data,
          };
          channelHandlers.forEach((handler) => handler(ipcEvent));
        }
      }
    });
  }

  return {
    send(channel: string, data: unknown): void {
      if (isBrowser) {
        if (window.parent !== window) {
          window.parent.postMessage({ channel, data }, targetOrigin);
        }

        if (window.opener) {
          window.opener.postMessage({ channel, data }, targetOrigin);
        }
        // Broadcast to all iframes
        const iframes = document.querySelectorAll("iframe");
        iframes.forEach((iframe) => {
          if (iframe.contentWindow) {
            iframe.contentWindow.postMessage({ channel, data }, targetOrigin);
          }
        });
      }
    },

    on(channel: string, handler: (event: IPCEvent) => void): () => void {
      if (!handlers.has(channel)) {
        handlers.set(channel, new Set());
      }
      handlers.get(channel)!.add(handler);

      return () => {
        const channelHandlers = handlers.get(channel);
        if (channelHandlers) {
          channelHandlers.delete(handler);
          if (channelHandlers.size === 0) {
            handlers.delete(channel);
          }
        }
      };
    },

    isAvailable(): boolean {
      return isBrowser;
    },

    getEnvironment(): "renderer" | "main" | null {
      // Browser is always considered 'renderer' in Electron terms
      return isBrowser ? "renderer" : null;
    },
  };
}
