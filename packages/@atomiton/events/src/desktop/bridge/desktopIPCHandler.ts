import type { IPCBridge, IPCContext, IPCEvent } from "#core/types";

function detectElectronEnvironment(): "renderer" | "main" | null {
  if (typeof process === "undefined") return null;
  if (!process || typeof process !== "object" || !("type" in process))
    return null;

  const electronProcess = process as typeof process & { type?: string };
  if (electronProcess.type === "renderer") return "renderer";
  if (electronProcess.type === "browser") return "main";
  return null;
}

function loadRendererIPC(ctx: IPCContext): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ctx.ipcRenderer = require("electron").ipcRenderer;
  } catch {}
}

function loadMainIPC(ctx: IPCContext): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const electron = require("electron");
    ctx.ipcMain = electron.ipcMain;
    ctx.webContents = electron.webContents;
  } catch {}
}

function initializeDesktopIPC(): IPCContext {
  const environment = detectElectronEnvironment();
  const ctx: IPCContext = { environment, handlers: new Map() };

  if (environment === "renderer") loadRendererIPC(ctx);
  if (environment === "main") loadMainIPC(ctx);

  return ctx;
}

function createSend(ctx: IPCContext) {
  return (channel: string, data: unknown): void => {
    if (ctx.environment === "renderer" && ctx.ipcRenderer) {
      ctx.ipcRenderer.send(channel, data);
    } else if (ctx.environment === "main" && ctx.webContents) {
      ctx.webContents.getAllWebContents().forEach((contents) => {
        contents.send(channel, data);
      });
    }
  };
}

function setupChannelHandler(
  ctx: IPCContext,
  channel: string,
  handler: (event: IPCEvent) => void,
): void {
  const wrappedHandler = (_: unknown, data: unknown) => {
    handler({ channel, data });
  };

  if (ctx.environment === "renderer" && ctx.ipcRenderer) {
    ctx.ipcRenderer.on(channel, wrappedHandler);
  } else if (ctx.environment === "main" && ctx.ipcMain) {
    ctx.ipcMain.on(channel, wrappedHandler);
  }
}

function createCleanupFn(
  ctx: IPCContext,
  channel: string,
  handler: (event: IPCEvent) => void,
) {
  return () => {
    const channelHandlers = ctx.handlers.get(channel);
    if (channelHandlers) {
      channelHandlers.delete(handler);
      if (channelHandlers.size === 0) {
        ctx.handlers.delete(channel);
      }
    }
  };
}

function createOn(ctx: IPCContext) {
  return (channel: string, handler: (event: IPCEvent) => void) => {
    if (!ctx.handlers.has(channel)) {
      ctx.handlers.set(channel, new Set());
    }
    ctx.handlers.get(channel)!.add(handler);

    setupChannelHandler(ctx, channel, handler);
    return createCleanupFn(ctx, channel, handler);
  };
}

function createIsAvailable(ctx: IPCContext) {
  return (): boolean => {
    return ctx.environment !== null && (!!ctx.ipcRenderer || !!ctx.ipcMain);
  };
}

export function createDesktopIPCHandler(): IPCBridge {
  const ctx = initializeDesktopIPC();

  return {
    send: createSend(ctx),
    on: createOn(ctx),
    isAvailable: createIsAvailable(ctx),
    getEnvironment: () => ctx.environment,
  };
}
