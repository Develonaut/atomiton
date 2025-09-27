import type { inferAsyncReturnType } from "@trpc/server";

export interface User {
  id: string;
  name?: string;
  email?: string;
}

export interface CreateContextOptions {
  user?: User;
  platform?: "desktop" | "web" | "mobile";
  environment?: "development" | "production" | "test";
  version?: string;
  capabilities?: {
    fileSystem?: boolean;
    network?: boolean;
    storage?: boolean;
  };
}

export async function createContext(options: CreateContextOptions = {}) {
  return {
    user: options.user || null,
    platform: options.platform || "web",
    environment: options.environment || "development",
    version: options.version || "0.0.0",
    capabilities: {
      fileSystem: options.capabilities?.fileSystem ?? false,
      network: options.capabilities?.network ?? true,
      storage: options.capabilities?.storage ?? true,
    },
  };
}

export async function createDesktopContext(): Promise<Context> {
  return createContext({
    platform: "desktop",
    capabilities: {
      fileSystem: true,
      network: true,
      storage: true,
    },
  });
}

export async function createWebContext(): Promise<Context> {
  return createContext({
    platform: "web",
    capabilities: {
      fileSystem: false,
      network: true,
      storage: true,
    },
  });
}

export type Context = inferAsyncReturnType<typeof createContext>;
