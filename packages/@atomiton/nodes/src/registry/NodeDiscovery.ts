/**
 * Node Package Discovery System
 *
 * Automatically discovers and loads node packages from the file system.
 * Supports hot reloading in development mode.
 */

import * as path from "path";

import { EventEmitter } from "eventemitter3";

import type { NodePackageRegistry } from "./NodePackageRegistry";
import type { NodePackage } from "../base/NodePackage";

/**
 * Discovery events
 */
interface DiscoveryEvents {
  "discovery:started": () => void;
  "discovery:completed": (discovered: number) => void;
  "discovery:error": (error: Error, filePath?: string) => void;
  "package:discovered": (packageId: string, filePath: string) => void;
  "package:loaded": (nodePackage: NodePackage, filePath: string) => void;
  "package:load-error": (error: Error, filePath: string) => void;
}

/**
 * Discovery configuration
 */
export interface DiscoveryConfig {
  /** Base directory to search from */
  baseDirectory: string;
  /** File patterns to match */
  patterns: string[];
  /** Exclude patterns */
  excludePatterns: string[];
  /** Enable hot reloading */
  hotReload: boolean;
  /** Maximum concurrent loads */
  maxConcurrentLoads: number;
}

/**
 * Node Package Discovery Implementation
 */
export class NodePackageDiscovery extends EventEmitter<DiscoveryEvents> {
  private config: DiscoveryConfig;
  private registry: NodePackageRegistry;
  private watchers = new Map<string, unknown>(); // File watchers for hot reload
  private loadedPackages = new Map<string, NodePackage>();

  constructor(
    registry: NodePackageRegistry,
    config: Partial<DiscoveryConfig> = {},
  ) {
    super();
    this.registry = registry;
    this.config = {
      baseDirectory: path.join(process.cwd(), "src/nodes"),
      patterns: ["**/index.ts", "**/index.tsx"],
      excludePatterns: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
      ],
      hotReload: process.env.NODE_ENV === "development",
      maxConcurrentLoads: 5,
      ...config,
    };
  }

  /**
   * Start package discovery
   */
  async discover(): Promise<number> {
    this.emit("discovery:started");

    try {
      const packageFiles = await this.findPackageFiles();
      const discovered = await this.loadPackages(packageFiles);

      if (this.config.hotReload) {
        await this.setupHotReload(packageFiles);
      }

      this.emit("discovery:completed", discovered);
      return discovered;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.emit("discovery:error", err);
      throw err;
    }
  }

  /**
   * Find all package files matching patterns
   */
  private async findPackageFiles(): Promise<string[]> {
    const glob = await import("glob"); // Dynamic import for optional dependency
    const files: string[] = [];

    for (const pattern of this.config.patterns) {
      const fullPattern = path.join(this.config.baseDirectory, pattern);

      try {
        const matches = await glob.glob(fullPattern, {
          ignore: this.config.excludePatterns.map((p) =>
            path.join(this.config.baseDirectory, p),
          ),
        });

        files.push(...matches);
      } catch (error) {
        console.warn(`Failed to search pattern ${pattern}:`, error);
      }
    }

    // Remove duplicates and sort
    return [...new Set(files)].sort();
  }

  /**
   * Load packages from file paths with concurrency control
   */
  private async loadPackages(filePaths: string[]): Promise<number> {
    const semaphore = new Semaphore(this.config.maxConcurrentLoads);
    const loadPromises = filePaths.map((filePath) =>
      semaphore.acquire(() => this.loadPackage(filePath)),
    );

    const results = await Promise.allSettled(loadPromises);

    let successCount = 0;
    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        successCount++;
      } else if (result.status === "rejected") {
        this.emit("package:load-error", result.reason, filePaths[index]!);
      }
    });

    return successCount;
  }

  /**
   * Load a single package from file path
   */
  private async loadPackage(filePath: string): Promise<NodePackage | null> {
    try {
      // Clear require cache for hot reloading
      if (this.config.hotReload && require.cache[filePath]) {
        delete require.cache[filePath];
      }

      // Import the package module
      const module = await import(filePath);

      // Look for exported NodePackage
      const nodePackage = this.extractNodePackage(module);
      if (!nodePackage) {
        console.warn(`No valid NodePackage found in ${filePath}`);
        return null;
      }

      this.emit("package:discovered", nodePackage.definition.id, filePath);

      // Register with the registry
      await this.registry.register(nodePackage, filePath);
      this.loadedPackages.set(filePath, nodePackage);

      this.emit("package:loaded", nodePackage, filePath);

      return nodePackage;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.emit("package:load-error", err, filePath);
      return null;
    }
  }

  /**
   * Extract NodePackage from module exports
   */
  private extractNodePackage(module: unknown): NodePackage | null {
    if (!module || typeof module !== "object") {
      return null;
    }

    const moduleObj = module as Record<string, unknown>;

    // Check for default export
    if (moduleObj.default && this.isNodePackage(moduleObj.default)) {
      return moduleObj.default as NodePackage;
    }

    // Check for named exports
    for (const value of Object.values(moduleObj)) {
      if (this.isNodePackage(value)) {
        return value as NodePackage;
      }
    }

    // Check for common naming patterns
    const commonNames = ["nodePackage", "node", "package"];
    for (const name of commonNames) {
      if (moduleObj[name] && this.isNodePackage(moduleObj[name])) {
        return moduleObj[name] as NodePackage;
      }
    }

    return null;
  }

  /**
   * Type guard to check if object is a NodePackage
   */
  private isNodePackage(obj: unknown): obj is NodePackage {
    if (!obj || typeof obj !== "object") {
      return false;
    }

    const candidate = obj as Record<string, unknown>;
    return Boolean(
      candidate.definition &&
        candidate.logic &&
        candidate.ui &&
        candidate.configSchema &&
        candidate.metadata,
    );
  }

  /**
   * Setup hot reloading for development
   */
  private async setupHotReload(filePaths: string[]): Promise<void> {
    if (!this.config.hotReload) return;

    try {
      const chokidar = await import("chokidar"); // Dynamic import for optional dependency

      for (const filePath of filePaths) {
        if (this.watchers.has(filePath)) {
          continue; // Already watching
        }

        const watcher = chokidar.watch(filePath, {
          ignored: /node_modules/,
          persistent: true,
          ignoreInitial: true,
        });

        watcher.on("change", async () => {
          this.emit("discovery:started");

          try {
            // Unregister existing package
            const existingPackage = this.loadedPackages.get(filePath);
            if (existingPackage) {
              this.registry.unregister(existingPackage.definition.id);
            }

            // Reload package
            await this.loadPackage(filePath);
          } catch (error) {
            console.error(`Failed to hot reload ${filePath}:`, error);
          }
        });

        this.watchers.set(filePath, watcher);
      }
    } catch (error) {
      console.warn(
        "Hot reloading not available (chokidar not installed):",
        error,
      );
    }
  }

  /**
   * Stop discovery and cleanup watchers
   */
  async stop(): Promise<void> {
    // Close all file watchers
    for (const watcher of this.watchers.values()) {
      if (
        watcher &&
        typeof watcher === "object" &&
        "close" in watcher &&
        typeof (watcher as { close: unknown }).close === "function"
      ) {
        await (watcher as { close: () => Promise<void> }).close();
      }
    }

    this.watchers.clear();
    this.loadedPackages.clear();
  }

  /**
   * Get discovery statistics
   */
  getStats() {
    return {
      watchedFiles: this.watchers.size,
      loadedPackages: this.loadedPackages.size,
      hotReloadEnabled: this.config.hotReload,
    };
  }
}

/**
 * Simple semaphore for controlling concurrency
 */
class Semaphore {
  private permits: number;
  private waiting: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire<T>(task: () => Promise<T>): Promise<T> {
    await new Promise<void>((resolve) => {
      if (this.permits > 0) {
        this.permits--;
        resolve();
      } else {
        this.waiting.push(resolve);
      }
    });

    try {
      return await task();
    } finally {
      this.release();
    }
  }

  private release(): void {
    this.permits++;
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift()!;
      this.permits--;
      resolve();
    }
  }
}

/**
 * Auto-discovery helper function
 */
export async function autoDiscoverNodes(
  registry: NodePackageRegistry,
  config?: Partial<DiscoveryConfig>,
): Promise<number> {
  const discovery = new NodePackageDiscovery(registry, config);

  // Set up error handling
  discovery.on("discovery:error", (error) => {
    console.error("Node discovery error:", error);
  });

  discovery.on("package:load-error", (error, filePath) => {
    console.error(`Failed to load node package from ${filePath}:`, error);
  });

  try {
    const discovered = await discovery.discover();
    // Log information is handled via events
    return discovered;
  } catch (error) {
    console.error("Failed to discover node packages:", error);
    throw error;
  }
}
