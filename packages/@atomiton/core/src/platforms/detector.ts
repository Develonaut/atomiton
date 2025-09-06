export type Platform = "browser" | "desktop" | "test" | "unknown";

export interface PlatformInfo {
  platform: Platform;
  isNode: boolean;
  isBrowser: boolean;
  isElectron: boolean;
  isTest: boolean;
  features: PlatformFeatures;
}

export interface PlatformFeatures {
  hasFileSystem: boolean;
  hasIndexedDB: boolean;
  hasLocalStorage: boolean;
  hasWebWorkers: boolean;
  hasNodeProcess: boolean;
  hasElectronAPI: boolean;
}

export function detectPlatform(): PlatformInfo {
  const isNode =
    typeof process !== "undefined" && process.versions?.node !== undefined;

  const isBrowser =
    typeof window !== "undefined" && typeof document !== "undefined" && !isNode;

  const isElectron =
    isNode &&
    typeof process !== "undefined" &&
    process.versions?.electron !== undefined;

  const isTest =
    typeof process !== "undefined" &&
    (process.env.NODE_ENV === "test" ||
      process.env.JEST_WORKER_ID !== undefined);

  let platform: Platform;
  if (isTest) {
    platform = "test";
  } else if (isElectron || (isNode && !isBrowser)) {
    platform = "desktop";
  } else if (isBrowser) {
    platform = "browser";
  } else {
    platform = "unknown";
  }

  const features: PlatformFeatures = {
    hasFileSystem: isNode || isElectron,
    hasIndexedDB: isBrowser && "indexedDB" in (globalThis || {}),
    hasLocalStorage: isBrowser && "localStorage" in (globalThis || {}),
    hasWebWorkers: isBrowser && "Worker" in (globalThis || {}),
    hasNodeProcess: isNode || isElectron,
    hasElectronAPI:
      isElectron &&
      typeof window !== "undefined" &&
      "electron" in (window as unknown as Record<string, unknown>),
  };

  return {
    platform,
    isNode,
    isBrowser,
    isElectron,
    isTest,
    features,
  };
}

let cachedPlatformInfo: PlatformInfo | null = null;

export function getPlatformInfo(): PlatformInfo {
  if (!cachedPlatformInfo) {
    cachedPlatformInfo = detectPlatform();
  }
  return cachedPlatformInfo;
}

export function resetPlatformCache(): void {
  cachedPlatformInfo = null;
}

export function hasFeature(feature: keyof PlatformFeatures): boolean {
  const info = getPlatformInfo();
  return info.features[feature] ?? false;
}

export function getPlatform(): Platform {
  return getPlatformInfo().platform;
}

export function assertBrowser(): void {
  const info = getPlatformInfo();
  if (!info.isBrowser) {
    throw new Error("This operation requires a browser environment");
  }
}

export function assertDesktop(): void {
  const info = getPlatformInfo();
  if (info.platform !== "desktop") {
    throw new Error("This operation requires a desktop environment");
  }
}

export function assertNodeEnvironment(): void {
  const info = getPlatformInfo();
  if (!info.isNode) {
    throw new Error("This operation requires a Node.js environment");
  }
}
