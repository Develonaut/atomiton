import type { IPCBridge, IPCEvent } from "./types";

function detectElectronEnvironment(): "renderer" | "main" | null {
  if (typeof process === "undefined") return null;
  if (!process || typeof process !== "object" || !("type" in process))
    return null;

  const electronProcess = process as typeof process & { type?: string };
  if (electronProcess.type === "renderer") return "renderer";
  if (electronProcess.type === "browser") return "main";
  return null;
}

type IPCContext = {
  environment: "renderer" | "main" | null;
  handlers: Map<string, Set<(event: IPCEvent) => void>>;
  ipcRenderer?: {
    send: (channel: string, data: unknown) => void;
    on: (
      channel: string,
      listener: (event: unknown, data: unknown) => void,
    ) => void;
  };
  ipcMain?: {
    on: (
      channel: string,
      listener: (event: unknown, data: unknown) => void,
    ) => void;
  };
  webContents?: {
    getAllWebContents: () => Array<{
      id: number;
      send: (channel: string, data: unknown) => void;
    }>;
  };
};

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

function initializeIPC(): IPCContext {
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
  if (ctx.environment === "renderer" && ctx.ipcRenderer) {
    ctx.ipcRenderer.on(channel, (_: unknown, data: unknown) => {
      handler({ channel, data });
    });
  } else if (ctx.environment === "main" && ctx.ipcMain) {
    ctx.ipcMain.on(channel, (_: unknown, data: unknown) => {
      handler({ channel, data });
    });
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

export function createIPCBridge(): IPCBridge {
  const ctx = initializeIPC();

  return {
    send: createSend(ctx),
    on: createOn(ctx),
    isAvailable: createIsAvailable(ctx),
    getEnvironment: () => ctx.environment,
  };
}
