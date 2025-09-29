import { type VType } from "@atomiton/validation";
import type { BrowserWindow, IpcMain } from "electron";

// Types for functional channel architecture
export type Handler = (args: unknown) => Promise<unknown>;
export type Middleware = (
  args: unknown,
  next: () => Promise<unknown>,
) => Promise<unknown>;

/**
 * Options for creating a channel server
 */
export type ChannelServerOptions = {
  middleware?: Middleware[];
};

export type ChannelServer = {
  handle: (method: string, handler: Handler) => void;
  broadcast: (event: string, data: unknown) => void;
  trackWindow?: (window: BrowserWindow) => void;
  dispose: () => void;
};

/**
 * Functional factory for channel servers
 */
export const createChannelServer = (
  channelName: string,
  ipcMain: IpcMain,
  options: ChannelServerOptions = {},
): ChannelServer => {
  const handlers = new Map<string, Handler>();
  const windows = new Set<BrowserWindow>();
  const middlewares: Middleware[] = [];

  // Default middleware: simple logging
  const loggingMiddleware: Middleware = async (args, next) => {
    const start = Date.now();
    console.log(`[CHANNEL:${channelName.toUpperCase()}] Handler called`);
    try {
      const result = await next();
      console.log(
        `[CHANNEL:${channelName.toUpperCase()}] Handler succeeded in ${Date.now() - start}ms`,
      );
      return result;
    } catch (error) {
      console.error(
        `[CHANNEL:${channelName.toUpperCase()}] Handler failed in ${Date.now() - start}ms:`,
        error,
      );
      throw error;
    }
  };

  // Add default middleware
  middlewares.push(loggingMiddleware);

  // Add custom middleware if provided
  if (options.middleware) {
    middlewares.push(...options.middleware);
  }

  // Compose middleware chain
  const composeMiddleware = (handler: Handler) => {
    return async (args: unknown) => {
      let index = 0;
      const dispatch = async (): Promise<unknown> => {
        if (index >= middlewares.length) {
          return handler(args);
        }
        const middleware = middlewares[index++];
        return middleware(args, dispatch);
      };
      return dispatch();
    };
  };

  // Channel API
  const server: ChannelServer = {
    // Register a handler for a specific method
    handle: (method: string, handler: Handler) => {
      console.log(
        `[CHANNEL:${channelName.toUpperCase()}] Registering handler: ${method}`,
      );
      handlers.set(method, handler);
    },

    // Broadcast event to all tracked windows
    broadcast: (eventName: string, data: unknown) => {
      console.log(
        `[CHANNEL:${channelName.toUpperCase()}] Broadcasting event:`,
        eventName,
      );
      windows.forEach((window) => {
        if (!window.isDestroyed()) {
          window.webContents.send(`${channelName}:event:${eventName}`, data);
        }
      });
    },

    // Track a window for broadcasts
    trackWindow: (window: BrowserWindow) => {
      windows.add(window);
      window.on("closed", () => {
        windows.delete(window);
      });
    },

    // Cleanup
    dispose: () => {
      console.log(
        `[CHANNEL:${channelName.toUpperCase()}] Disposing channel server`,
      );
      ipcMain.removeHandler(`${channelName}:call`);
      handlers.clear();
      windows.clear();
      console.log(
        `[CHANNEL:${channelName.toUpperCase()}] Channel server disposed`,
      );
    },
  };

  // Setup IPC handler
  ipcMain.handle(
    `${channelName}:call`,
    async (event, method: string, args: unknown) => {
      try {
        console.log(
          `[CHANNEL:${channelName.toUpperCase()}] Received IPC call:`,
          { method },
        );

        const handler = handlers.get(method);
        if (!handler) {
          console.error(
            `[CHANNEL:${channelName.toUpperCase()}] No handler for method:`,
            method,
          );
          return {
            error: `No handler for method: ${method}`,
            channelError: true,
          };
        }

        console.log(
          `[CHANNEL:${channelName.toUpperCase()}] Executing handler for:`,
          method,
        );

        // Apply middleware chain
        const wrappedHandler = composeMiddleware(handler);
        const result = await wrappedHandler(args);

        console.log(
          `[CHANNEL:${channelName.toUpperCase()}] Handler result received`,
        );
        return { result };
      } catch (error) {
        console.error(`[CHANNEL:${channelName.toUpperCase()}] Handler error:`, {
          method,
          error,
        });
        return {
          error: error instanceof Error ? error.message : String(error),
          channelError: true,
        };
      }
    },
  );

  console.log(`[CHANNEL:${channelName.toUpperCase()}] IPC handler registered`);

  return server;
};

// Simple retry middleware
export const withRetry = (attempts = 3): Middleware => {
  return async (args, next) => {
    let lastError: any;
    for (let i = 0; i < attempts; i++) {
      try {
        return await next();
      } catch (error) {
        lastError = error;
        if (i < attempts - 1) {
          console.log(`[RETRY] Attempt ${i + 1} failed, retrying...`);
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * Math.pow(2, i)),
          );
        }
      }
    }
    throw lastError;
  };
};

// Validation middleware using @atomiton/validation
export const withValidation = <T>(schema: VType<T>): Middleware => {
  return async (args, next) => {
    const result = schema.safeParse(args);
    if (!result.success) {
      const errors = result.error.errors.map(
        (e) => `${e.path.join(".")}: ${e.message}`,
      );
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }
    return next();
  };
};
