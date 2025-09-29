// Define the types locally to avoid circular dependency
export type ConductorTransport = {
  execute(node: any, context: any): Promise<any>;
  health(): Promise<any>;
};

// We'll use 'any' types here since this is pure transport - no business logic

// Channel client interface for different transports
type ChannelClient = {
  call: (command: string, args?: unknown) => Promise<unknown>;
  listen: (event: string, callback: (data: unknown) => void) => () => void;
  send?: (event: string, data?: unknown) => void;
};

type Transport = {
  channel: (name: string) => ChannelClient;
};

// Auto-detect environment and create appropriate transport
export const createRPCTransport = (): ConductorTransport => {
  const transport = detectTransport();

  return {
    async execute(node: any, context: any): Promise<any> {
      return transport.channel("node").call("execute", { node, context });
    },

    async health(): Promise<any> {
      return transport.channel("system").call("health");
    },
  };
};

// Transport detection logic
const detectTransport = (): Transport => {
  // Check for Electron environment (atomitonBridge from preload)
  if (typeof window !== "undefined" && (window as any).atomitonBridge) {
    console.log(
      "[TRANSPORT] Detected Electron environment, using IPC transport",
    );
    return createIPCTransport();
  }

  // Check for WebSocket support (browser)
  if (typeof window !== "undefined" && window.WebSocket) {
    console.log(
      "[TRANSPORT] Detected browser environment, using WebSocket transport",
    );
    return createWebSocketTransport();
  }

  // Check for Node.js environment
  if (typeof process !== "undefined" && process.versions?.node) {
    console.log(
      "[TRANSPORT] Detected Node.js environment, using HTTP transport",
    );
    return createHTTPTransport();
  }

  // Fallback to memory transport for testing
  console.warn(
    "[TRANSPORT] No suitable transport detected, using memory transport",
  );
  return createMemoryTransport();
};

// IPC Transport for Electron
const createIPCTransport = (): Transport => {
  const bridge = (window as any).atomitonBridge;
  const channels = new Map<string, ChannelClient>();

  return {
    channel: (name: string) => {
      if (!channels.has(name)) {
        channels.set(name, createIPCChannelClient(name, bridge));
      }
      return channels.get(name)!;
    },
  };
};

const createIPCChannelClient = (
  channelName: string,
  bridge: any,
): ChannelClient => {
  return {
    call: async (command: string, args?: unknown) => {
      console.log(`[IPC:${channelName}] Calling ${command}`, args);
      return bridge.call(channelName, command, args);
    },

    listen: (event: string, callback: (data: unknown) => void) => {
      console.log(`[IPC:${channelName}] Listening to ${event}`);
      return bridge.listen(channelName, event, callback);
    },

    send: (event: string, data?: unknown) => {
      console.log(`[IPC:${channelName}] Sending ${event}`, data);
      bridge.send(channelName, event, data);
    },
  };
};

// WebSocket Transport for browser
const createWebSocketTransport = (): Transport => {
  const wsUrl = (window as any).__ATOMITON_WS_URL__ || "ws://localhost:3001";
  const ws = new WebSocket(wsUrl);
  const channels = new Map<string, ChannelClient>();
  const pendingCalls = new Map<
    string,
    { resolve: (value: any) => void; reject: (error: any) => void }
  >();

  ws.onopen = () => {
    console.log("[WebSocket] Connected to", wsUrl);
  };

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);

      if (message.type === "response" && message.id) {
        const pending = pendingCalls.get(message.id);
        if (pending) {
          pendingCalls.delete(message.id);
          if (message.error) {
            pending.reject(new Error(message.error));
          } else {
            pending.resolve(message.result);
          }
        }
      }
    } catch (error) {
      console.error("[WebSocket] Message parse error:", error);
    }
  };

  ws.onerror = (error) => {
    console.error("[WebSocket] Connection error:", error);
  };

  return {
    channel: (name: string) => {
      if (!channels.has(name)) {
        channels.set(
          name,
          createWebSocketChannelClient(name, ws, pendingCalls),
        );
      }
      return channels.get(name)!;
    },
  };
};

const createWebSocketChannelClient = (
  channelName: string,
  ws: WebSocket,
  pendingCalls: Map<string, any>,
): ChannelClient => {
  return {
    call: async (command: string, args?: unknown) => {
      const id = crypto.randomUUID();
      const message = {
        type: "call",
        id,
        channel: channelName,
        command,
        args,
      };

      return new Promise((resolve, reject) => {
        pendingCalls.set(id, { resolve, reject });

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
        } else {
          reject(new Error("WebSocket not connected"));
        }

        // Timeout after 30 seconds
        setTimeout(() => {
          if (pendingCalls.has(id)) {
            pendingCalls.delete(id);
            reject(new Error("Request timeout"));
          }
        }, 30000);
      });
    },

    listen: (event: string, callback: (data: unknown) => void) => {
      const handler = (wsEvent: MessageEvent) => {
        try {
          const message = JSON.parse(wsEvent.data);
          if (
            message.type === "event" &&
            message.channel === channelName &&
            message.event === event
          ) {
            callback(message.data);
          }
        } catch (error) {
          console.error("[WebSocket] Event parse error:", error);
        }
      };

      ws.addEventListener("message", handler);

      return () => {
        ws.removeEventListener("message", handler);
      };
    },
  };
};

// HTTP Transport for Node.js
const createHTTPTransport = (): Transport => {
  const baseURL = process.env.ATOMITON_API_URL || "http://localhost:3000";

  return {
    channel: (name: string) => createHTTPChannelClient(name, baseURL),
  };
};

const createHTTPChannelClient = (
  channelName: string,
  baseURL: string,
): ChannelClient => {
  return {
    call: async (command: string, args?: unknown) => {
      const url = `${baseURL}/api/${channelName}/${command}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(args),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },

    listen: (event: string, callback: (data: unknown) => void) => {
      console.warn("[HTTP] Real-time events not supported over HTTP transport");
      // Return no-op unsubscribe function
      return () => {};
    },
  };
};

// Memory Transport for testing
const createMemoryTransport = (): Transport => {
  const handlers = new Map<string, Map<string, (args: any) => Promise<any>>>();
  const eventListeners = new Map<
    string,
    Map<string, Set<(data: unknown) => void>>
  >();

  // Register some default handlers for testing
  const nodeHandlers = new Map<string, (args: any) => Promise<any>>();
  nodeHandlers.set("execute", async (args) => {
    // Mock execution result
    return {
      success: true,
      data: `Mock result for ${args.node?.type || "unknown"} node`,
      duration: 100,
      executedNodes: [args.node?.id || "mock-id"],
    };
  });
  nodeHandlers.set("validate", async (args) => {
    return {
      valid: true,
      errors: [],
    };
  });

  const systemHandlers = new Map<string, (args: any) => Promise<any>>();
  systemHandlers.set("health", async () => {
    return {
      status: "ok",
      timestamp: Date.now(),
      message: "Memory transport operational",
    };
  });

  handlers.set("node", nodeHandlers);
  handlers.set("system", systemHandlers);

  return {
    channel: (name: string) =>
      createMemoryChannelClient(name, handlers, eventListeners),
  };
};

const createMemoryChannelClient = (
  channelName: string,
  handlers: Map<string, Map<string, (args: any) => Promise<any>>>,
  eventListeners: Map<string, Map<string, Set<(data: unknown) => void>>>,
): ChannelClient => {
  return {
    call: async (command: string, args?: unknown) => {
      const channelHandlers = handlers.get(channelName);
      const handler = channelHandlers?.get(command);

      if (!handler) {
        throw new Error(
          `No handler for ${channelName}:${command} in memory transport`,
        );
      }

      return handler(args);
    },

    listen: (event: string, callback: (data: unknown) => void) => {
      if (!eventListeners.has(channelName)) {
        eventListeners.set(channelName, new Map());
      }

      const channelListeners = eventListeners.get(channelName)!;
      if (!channelListeners.has(event)) {
        channelListeners.set(event, new Set());
      }

      const eventSet = channelListeners.get(event)!;
      eventSet.add(callback);

      // Return unsubscribe function
      return () => {
        eventSet.delete(callback);
      };
    },

    // For testing - allow manual event emission
    __emit: (event: string, data: unknown) => {
      const channelListeners = eventListeners.get(channelName);
      const eventSet = channelListeners?.get(event);
      if (eventSet) {
        eventSet.forEach((callback) => callback(data));
      }
    },
  } as ChannelClient & { __emit: (event: string, data: unknown) => void };
};

// Export transport creation utilities
export {
  createHTTPTransport,
  createIPCTransport,
  createMemoryTransport,
  createWebSocketTransport,
};

// Export types
export type { ChannelClient, Transport };
