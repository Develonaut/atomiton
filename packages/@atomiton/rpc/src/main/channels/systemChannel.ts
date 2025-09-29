import {
  createChannelServer,
  type ChannelServer,
} from "#main/channels/createChannelServer";
import type { IpcMain } from "electron";
import { app } from "electron";
import * as os from "os";

// Types for system channel operations
export type HealthResult = {
  status: "ok" | "error";
  timestamp: number;
  message?: string;
};

export type MetricsResult = {
  performance: {
    uptime: number;
    cpuUsage: number;
    memoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    activeHandles: number;
    activeRequests: number;
  };
  system: {
    platform: string;
    arch: string;
    cpuCount: number;
    totalMemory: number;
    freeMemory: number;
  };
  app: {
    name: string;
    version: string;
    electronVersion: string;
    nodeVersion: string;
  };
};

export type RestartParams = {
  force?: boolean;
  delay?: number;
};

// Functional factory for system channel server
export const createSystemChannelServer = (ipcMain: IpcMain): ChannelServer => {
  const server = createChannelServer("system", ipcMain);

  // Track app start time for metrics
  const appStartTime = Date.now();

  // Helper functions for metrics (not health check)
  const getMemoryInfo = () => {
    const memUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    return {
      used: usedMemory,
      total: totalMemory,
      percentage: Math.round((usedMemory / totalMemory) * 100),
      process: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
      },
    };
  };

  const getCPUUsage = (): number => {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach((cpu) => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - Math.floor((idle * 100) / total);

    return usage;
  };

  // Register command handlers
  server.handle("health", async (): Promise<HealthResult> => {
    // Simple ping-pong health check to verify IPC connection
    console.log("[SYSTEM] Health check ping received, responding with pong");

    return {
      status: "ok",
      timestamp: Date.now(),
      message: "IPC connection active",
    };
  });

  server.handle("metrics", async (): Promise<MetricsResult> => {
    const uptime = Date.now() - appStartTime;
    const memUsage = process.memoryUsage();

    const metrics: MetricsResult = {
      performance: {
        uptime,
        cpuUsage: getCPUUsage(),
        memoryUsage: {
          rss: memUsage.rss,
          heapTotal: memUsage.heapTotal,
          heapUsed: memUsage.heapUsed,
          external: memUsage.external,
        },
        activeHandles: (process as any)._getActiveHandles?.()?.length || 0,
        activeRequests: (process as any)._getActiveRequests?.()?.length || 0,
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        cpuCount: os.cpus().length,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
      },
      app: {
        name: app.getName(),
        version: app.getVersion(),
        electronVersion: process.versions.electron || "unknown",
        nodeVersion: process.version,
      },
    };

    console.log("[SYSTEM] Metrics collected:", {
      cpuUsage: metrics.performance.cpuUsage,
      heapUsed: metrics.performance.memoryUsage.heapUsed,
      uptime: metrics.performance.uptime,
    });

    return metrics;
  });

  server.handle("restart", async (params: unknown): Promise<void> => {
    const typedParams = (params || {}) as RestartParams;
    const { force = false, delay = 1000 } = typedParams;

    console.warn("[SYSTEM] App restart requested", { force, delay });

    // Broadcast restart event
    server.broadcast("appRestarting", {
      force,
      delay,
      timestamp: new Date().toISOString(),
    });

    // Schedule restart
    setTimeout(() => {
      if (force) {
        app.exit();
        app.relaunch();
      } else {
        app.relaunch();
        app.quit();
      }
    }, delay);
  });

  server.handle("shutdown", async (): Promise<void> => {
    console.warn("[SYSTEM] App shutdown requested");

    // Broadcast shutdown event
    server.broadcast("appShuttingDown", {
      timestamp: new Date().toISOString(),
    });

    // Graceful shutdown
    setTimeout(() => {
      app.quit();
    }, 1000);
  });

  server.handle("getConfig", async (): Promise<unknown> => {
    return {
      appPath: app.getAppPath(),
      userDataPath: app.getPath("userData"),
      tempPath: app.getPath("temp"),
      locale: app.getLocale(),
      version: app.getVersion(),
      name: app.getName(),
    };
  });

  server.handle("getSystemInfo", async (): Promise<unknown> => {
    return {
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      cpus: os.cpus().map((cpu) => ({
        model: cpu.model,
        speed: cpu.speed,
      })),
      networkInterfaces: Object.entries(os.networkInterfaces()).reduce(
        (acc, [name, interfaces]) => {
          if (interfaces) {
            acc[name] = interfaces
              .filter((iface) => !iface.internal)
              .map((iface) => ({
                address: iface.address,
                family: iface.family,
              }));
          }
          return acc;
        },
        {} as Record<string, any[]>,
      ),
      uptime: os.uptime(),
    };
  });

  return server;
};
