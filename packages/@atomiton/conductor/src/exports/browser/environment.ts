/**
 * Environment detection utilities for browser conductor
 */

import type { ConductorTransport } from "#types";

/**
 * Environment information for the conductor
 */
export type EnvironmentInfo = {
  type: "desktop" | "browser";
  isDesktop: boolean;
  hasTransport: boolean;
  capabilities: {
    nodeExecution: boolean;
    localStorage: boolean;
    sessionStorage: boolean;
    fileSystem: boolean;
    cloudExecution: boolean;
  };
  details: {
    userAgent: string;
    platform: string;
  };
};

/**
 * Calculate environment information once for reuse
 */
export function getEnvironmentInfo(
  transport: ConductorTransport | undefined,
): EnvironmentInfo {
  const hasTransport = !!transport;
  const hasBridge = typeof window !== "undefined" && !!window?.atomitonBridge;
  const type = hasBridge ? ("desktop" as const) : ("browser" as const);

  return {
    type,
    isDesktop: hasBridge,
    hasTransport,
    capabilities: {
      nodeExecution: hasTransport,
      localStorage: typeof window !== "undefined" && !!window?.localStorage,
      sessionStorage: typeof window !== "undefined" && !!window?.sessionStorage,
      fileSystem: hasBridge, // Only Electron has file system access
      cloudExecution: false, // Future: will be true for cloud environments
    },
    details: {
      userAgent:
        typeof window !== "undefined" && window?.navigator
          ? window.navigator.userAgent
          : "unknown",
      platform:
        typeof window !== "undefined" && window?.navigator
          ? window.navigator.platform
          : "unknown",
    },
  };
}
