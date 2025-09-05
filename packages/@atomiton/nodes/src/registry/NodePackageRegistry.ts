/**
 * Node Package Registry
 *
 * Manages registration, discovery, and validation of node packages.
 * Ensures 1:1 mapping between logic and UI components.
 */

import { EventEmitter } from "eventemitter3";

import type {
  NodePackage,
  NodePackageRegistryEntry,
} from "../base/NodePackage";

/**
 * Registry events for monitoring changes
 */
interface RegistryEvents {
  "package:registered": (entry: NodePackageRegistryEntry) => void;
  "package:unregistered": (id: string) => void;
  "package:updated": (entry: NodePackageRegistryEntry) => void;
  "package:validation-failed": (id: string, errors: string[]) => void;
  "registry:ready": () => void;
  "registry:error": (error: Error) => void;
}

/**
 * Registry configuration
 */
export interface RegistryConfig {
  /** Enable validation on registration */
  validateOnRegister: boolean;
  /** Enable auto-discovery of node packages */
  autoDiscovery: boolean;
  /** Package discovery patterns */
  discoveryPatterns: string[];
  /** Maximum validation retries */
  maxValidationRetries: number;
  /** Enable hot reloading in development */
  hotReload: boolean;
}

/**
 * Default registry configuration
 */
const DEFAULT_CONFIG: RegistryConfig = {
  validateOnRegister: true,
  autoDiscovery: true,
  discoveryPatterns: ["./nodes/**/*.ts", "./nodes/**/*.tsx"],
  maxValidationRetries: 3,
  hotReload: process.env.NODE_ENV === "development",
};

/**
 * Node Package Registry Implementation
 *
 * Manages the lifecycle of node packages and ensures consistency
 */
export class NodePackageRegistry extends EventEmitter<RegistryEvents> {
  private packages = new Map<string, NodePackageRegistryEntry>();
  private config: RegistryConfig;
  private isReady = false;

  constructor(config: Partial<RegistryConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Register a node package
   */
  async register(
    nodePackage: NodePackage,
    filePath?: string,
  ): Promise<NodePackageRegistryEntry> {
    const id = nodePackage.definition.id;

    // Validate package if enabled
    let validation: { valid: boolean; errors: string[]; lastChecked: Date };

    if (this.config.validateOnRegister) {
      validation = this.validatePackage(nodePackage);

      if (!validation.valid) {
        this.emit("package:validation-failed", id, validation.errors);
        throw new Error(
          `Node package validation failed for '${id}': ${validation.errors.join(", ")}`,
        );
      }
    } else {
      validation = {
        valid: true,
        errors: [],
        lastChecked: new Date(),
      };
    }

    const entry: NodePackageRegistryEntry = {
      id,
      package: nodePackage,
      registeredAt: new Date(),
      filePath,
      validation,
    };

    // Check if package is already registered
    const existingEntry = this.packages.get(id);
    if (existingEntry) {
      console.warn(`Node package '${id}' is already registered. Updating...`);
      this.packages.set(id, entry);
      this.emit("package:updated", entry);
    } else {
      this.packages.set(id, entry);
      this.emit("package:registered", entry);
    }

    return entry;
  }

  /**
   * Unregister a node package
   */
  unregister(id: string): boolean {
    const existed = this.packages.delete(id);
    if (existed) {
      this.emit("package:unregistered", id);
    }
    return existed;
  }

  /**
   * Get a registered node package
   */
  get(id: string): NodePackageRegistryEntry | undefined {
    return this.packages.get(id);
  }

  /**
   * Get all registered node packages
   */
  getAll(): NodePackageRegistryEntry[] {
    return Array.from(this.packages.values());
  }

  /**
   * Get packages by category
   */
  getByCategory(category: string): NodePackageRegistryEntry[] {
    return this.getAll().filter(
      (entry) => entry.package.definition.category === category,
    );
  }

  /**
   * Search packages by keywords or name
   */
  search(query: string): NodePackageRegistryEntry[] {
    const lowerQuery = query.toLowerCase();

    return this.getAll().filter((entry) => {
      const pkg = entry.package;

      // Search in name and description
      const matchesName = pkg.definition.name
        .toLowerCase()
        .includes(lowerQuery);
      const matchesDescription = (pkg.definition.description || "")
        .toLowerCase()
        .includes(lowerQuery);

      // Search in keywords
      const matchesKeywords = pkg.metadata.keywords.some((keyword) =>
        keyword.toLowerCase().includes(lowerQuery),
      );

      return matchesName || matchesDescription || matchesKeywords;
    });
  }

  /**
   * Get packages that are ready for use (valid and not deprecated)
   */
  getAvailable(): NodePackageRegistryEntry[] {
    return this.getAll().filter(
      (entry) => entry.validation.valid && !entry.package.metadata.deprecated,
    );
  }

  /**
   * Get experimental packages
   */
  getExperimental(): NodePackageRegistryEntry[] {
    return this.getAll().filter((entry) => entry.package.metadata.experimental);
  }

  /**
   * Get deprecated packages
   */
  getDeprecated(): NodePackageRegistryEntry[] {
    return this.getAll().filter((entry) => entry.package.metadata.deprecated);
  }

  /**
   * Validate a node package
   */
  private validatePackage(nodePackage: NodePackage): {
    valid: boolean;
    errors: string[];
    lastChecked: Date;
  } {
    const errors: string[] = [];
    const lastChecked = new Date();

    // Basic package validation
    if (!nodePackage.definition) {
      errors.push("Package must have a definition");
    } else {
      // Validate definition structure
      if (!nodePackage.definition.id) {
        errors.push("Definition must have an id");
      }
      if (!nodePackage.definition.name) {
        errors.push("Definition must have a name");
      }
      if (!nodePackage.definition.execute) {
        errors.push("Definition must have an execute function");
      }
    }

    // Validate logic implementation
    if (!nodePackage.logic) {
      errors.push("Package must have logic implementation");
    } else {
      if (typeof nodePackage.logic.execute !== "function") {
        errors.push("Logic must have an execute function");
      }
    }

    // Validate UI component
    if (!nodePackage.ui) {
      errors.push("Package must have UI component");
    } else {
      // More robust React component validation
      const ui = nodePackage.ui as unknown;
      const isReactComponent =
        typeof ui === "function" ||
        (typeof ui === "object" &&
          ui !== null &&
          ((ui as Record<string, unknown>).$$typeof ||
            (ui as Record<string, unknown>)._payload ||
            (ui as Record<string, unknown>).render ||
            (ui as Record<string, unknown>).type ||
            (ui as Record<string, unknown>).displayName));

      if (!isReactComponent) {
        errors.push("UI must be a React component function or React element");
      }
    }

    // Validate config schema
    if (!nodePackage.configSchema) {
      errors.push("Package must have a config schema");
    }

    // Validate metadata
    if (!nodePackage.metadata) {
      errors.push("Package must have metadata");
    } else {
      if (!nodePackage.metadata.version) {
        errors.push("Metadata must have a version");
      }
      if (!nodePackage.metadata.author) {
        errors.push("Metadata must have an author");
      }
    }

    // Check for 1:1 mapping consistency
    if (nodePackage.definition && nodePackage.logic && nodePackage.ui) {
      // Verify that definition ID matches what's expected
      const definitionId = nodePackage.definition.id;
      const componentName = nodePackage.ui.displayName;

      if (componentName && !componentName.includes(definitionId)) {
        console.warn(
          `UI component name '${componentName}' doesn't match node id '${definitionId}'`,
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      lastChecked,
    };
  }

  /**
   * Validate all registered packages
   */
  async validateAll(): Promise<{
    valid: number;
    invalid: number;
    errors: Record<string, string[]>;
  }> {
    let validCount = 0;
    let invalidCount = 0;
    const errors: Record<string, string[]> = {};

    for (const [id, entry] of this.packages.entries()) {
      const validation = this.validatePackage(entry.package);

      entry.validation = validation;

      if (validation.valid) {
        validCount++;
      } else {
        invalidCount++;
        errors[id] = validation.errors;
        this.emit("package:validation-failed", id, validation.errors);
      }
    }

    return { valid: validCount, invalid: invalidCount, errors };
  }

  /**
   * Get registry statistics
   */
  getStats() {
    const all = this.getAll();
    const categories = new Map<string, number>();

    all.forEach((entry) => {
      const category = entry.package.definition.category;
      categories.set(category, (categories.get(category) || 0) + 1);
    });

    return {
      total: all.length,
      available: this.getAvailable().length,
      experimental: this.getExperimental().length,
      deprecated: this.getDeprecated().length,
      categories: Object.fromEntries(categories),
      validationSummary: {
        valid: all.filter((e) => e.validation.valid).length,
        invalid: all.filter((e) => !e.validation.valid).length,
      },
    };
  }

  /**
   * Check if registry is ready
   */
  ready(): boolean {
    return this.isReady;
  }

  /**
   * Mark registry as ready
   */
  markReady(): void {
    if (!this.isReady) {
      this.isReady = true;
      this.emit("registry:ready");
    }
  }

  /**
   * Clear all registered packages
   */
  clear(): void {
    const ids = Array.from(this.packages.keys());
    this.packages.clear();

    ids.forEach((id) => {
      this.emit("package:unregistered", id);
    });
  }

  /**
   * Export registry data for persistence
   */
  export(): {
    packages: Array<{
      id: string;
      version: string;
      registeredAt: string;
      filePath?: string;
    }>;
    stats: ReturnType<NodePackageRegistry["getStats"]>;
  } {
    return {
      packages: this.getAll().map((entry) => ({
        id: entry.id,
        version: entry.package.metadata.version,
        registeredAt: entry.registeredAt.toISOString(),
        filePath: entry.filePath,
      })),
      stats: this.getStats(),
    };
  }
}

/**
 * Global singleton registry instance
 */
let globalRegistry: NodePackageRegistry | null = null;

/**
 * Get or create the global registry instance
 */
export function getGlobalRegistry(
  config?: Partial<RegistryConfig>,
): NodePackageRegistry {
  if (!globalRegistry) {
    globalRegistry = new NodePackageRegistry(config);
  }
  return globalRegistry;
}

/**
 * Reset the global registry (useful for testing)
 */
export function resetGlobalRegistry(): void {
  if (globalRegistry) {
    globalRegistry.clear();
    globalRegistry.removeAllListeners();
  }
  globalRegistry = null;
}
