import type { Platform } from "../platforms/detector";
import { getPlatform } from "../platforms/detector";
import type { IExecutionClient } from "./execution/IExecutionClient";
import { NodeProcessClient } from "./execution/NodeProcessClient";
import { WebWorkerClient } from "./execution/WebWorkerClient";
import { FileSystemClient } from "./storage/FileSystemClient";
import { IndexedDBClient } from "./storage/IndexedDBClient";
import type { IStorageClient } from "./storage/IStorageClient";
import { MemoryClient } from "./storage/MemoryClient";

/**
 * Factory for creating platform-specific client implementations
 */
export class ClientFactory {
  private static storageInstances: Map<Platform, IStorageClient> = new Map();
  private static executionInstances: Map<Platform, IExecutionClient> =
    new Map();

  /**
   * Create a storage client for the specified platform
   * Uses singleton pattern to reuse clients
   */
  static createStorageClient(platform?: Platform): IStorageClient {
    const targetPlatform = platform || getPlatform();

    // Check for existing instance
    if (this.storageInstances.has(targetPlatform)) {
      return this.storageInstances.get(targetPlatform)!;
    }

    let client: IStorageClient;

    switch (targetPlatform) {
      case "browser":
        client = new IndexedDBClient();
        break;
      case "desktop":
        client = new FileSystemClient();
        break;
      case "test":
        client = new MemoryClient();
        break;
      case "unknown":
      default:
        // Fallback to memory client for unknown platforms
        console.warn(`Unknown platform: ${targetPlatform}, using MemoryClient`);
        client = new MemoryClient();
        break;
    }

    // Cache the instance
    this.storageInstances.set(targetPlatform, client);
    return client;
  }

  /**
   * Create an execution client for the specified platform
   * Uses singleton pattern to reuse clients
   */
  static createExecutionClient(platform?: Platform): IExecutionClient {
    const targetPlatform = platform || getPlatform();

    // Check for existing instance
    if (this.executionInstances.has(targetPlatform)) {
      return this.executionInstances.get(targetPlatform)!;
    }

    let client: IExecutionClient;

    switch (targetPlatform) {
      case "browser":
        client = new WebWorkerClient();
        break;
      case "desktop":
        client = new NodeProcessClient();
        break;
      case "test":
        // Use NodeProcessClient for testing if available, otherwise WebWorkerClient
        try {
          client = new NodeProcessClient();
        } catch {
          client = new WebWorkerClient();
        }
        break;
      case "unknown":
      default:
        throw new Error(
          `Execution is not supported on platform: ${targetPlatform}`,
        );
    }

    // Cache the instance
    this.executionInstances.set(targetPlatform, client);
    return client;
  }

  /**
   * Create a fresh storage client (not cached)
   */
  static createFreshStorageClient(platform?: Platform): IStorageClient {
    const targetPlatform = platform || getPlatform();

    switch (targetPlatform) {
      case "browser":
        return new IndexedDBClient();
      case "desktop":
        return new FileSystemClient();
      case "test":
        return new MemoryClient();
      case "unknown":
      default:
        return new MemoryClient();
    }
  }

  /**
   * Create a fresh execution client (not cached)
   */
  static createFreshExecutionClient(platform?: Platform): IExecutionClient {
    const targetPlatform = platform || getPlatform();

    switch (targetPlatform) {
      case "browser":
        return new WebWorkerClient();
      case "desktop":
        return new NodeProcessClient();
      case "test":
        try {
          return new NodeProcessClient();
        } catch {
          return new WebWorkerClient();
        }
      case "unknown":
      default:
        throw new Error(
          `Execution is not supported on platform: ${targetPlatform}`,
        );
    }
  }

  /**
   * Clear all cached instances
   */
  static clearCache(): void {
    // Cleanup existing instances
    for (const client of this.storageInstances.values()) {
      client.cleanup().catch(console.error);
    }
    for (const client of this.executionInstances.values()) {
      client.cleanup().catch(console.error);
    }

    this.storageInstances.clear();
    this.executionInstances.clear();
  }

  /**
   * Get information about available clients for current platform
   */
  static getAvailableClients(platform?: Platform): {
    storage: string;
    execution: string;
    platform: Platform;
  } {
    const targetPlatform = platform || getPlatform();

    const info = {
      platform: targetPlatform,
      storage: "MemoryClient",
      execution: "None",
    };

    switch (targetPlatform) {
      case "browser":
        info.storage = "IndexedDBClient";
        info.execution = "WebWorkerClient";
        break;
      case "desktop":
        info.storage = "FileSystemClient";
        info.execution = "NodeProcessClient";
        break;
      case "test":
        info.storage = "MemoryClient";
        info.execution = "NodeProcessClient or WebWorkerClient";
        break;
    }

    return info;
  }
}
