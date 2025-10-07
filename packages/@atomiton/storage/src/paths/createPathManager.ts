import path from "path";
import fs from "fs/promises";
import os from "os";

/**
 * Context in which the PathManager operates
 */
export type PathContext = "development" | "test" | "production";

/**
 * Valid Electron app.getPath() names
 */
export type ElectronPathName =
  | "home"
  | "appData"
  | "userData"
  | "sessionData"
  | "temp"
  | "exe"
  | "module"
  | "desktop"
  | "documents"
  | "downloads"
  | "music"
  | "pictures"
  | "videos"
  | "recent"
  | "logs"
  | "crashDumps";

/**
 * Configuration for creating a PathManager instance
 */
export type PathManagerConfig = {
  /** Operating context (test/development/production) */
  context: PathContext;
  /** Application name for path construction */
  appName?: string;
  /** Unique test identifier for isolated test environments */
  testId?: string;
  /** Path overrides for testing or custom configurations */
  overrides?: Partial<Record<string, string>>;
  /** Electron app.getPath function (optional, for dependency injection) */
  electronApp?: {
    getPath: (name: ElectronPathName) => string;
  };
};

/**
 * Map of all managed paths
 */
export type PathMap = {
  userData: string;
  documents: string;
  temp: string;
  logs: string;
  workspaces: string;
  flows: string;
  nodePackages: string;
  templates: string;
  exports: string;
  config: string;
  database: string;
};

/**
 * PathManager service for centralized path management
 */
export type PathManager = {
  /** Get the user data directory path */
  getUserDataPath(): string;
  /** Get the logs directory path */
  getLogsPath(): string;
  /** Get the temp directory path */
  getTempPath(): string;
  /** Get the path for a specific workspace */
  getWorkspacePath(workspaceId: string): string;
  /** Get the flows directory (optionally for a specific workspace) */
  getFlowsDirectory(workspaceId?: string): string;
  /** Get the full path for a specific flow file */
  getFlowPath(flowId: string, workspaceId?: string): string;
  /** Get the path for a config file */
  getConfigPath(configName: string): string;
  /** Get the path for a database file */
  getDatabasePath(dbName: string): string;
  /** Get the path for an export file */
  getExportPath(filename: string): string;
  /** Ensure a directory exists, creating it if necessary */
  ensureDirectory(dirPath: string): Promise<void>;
  /** Sanitize a path component to prevent traversal attacks */
  sanitizePath(component: string): string;
  /** Get the current operating context */
  getContext(): PathContext;
  /** Get all managed paths */
  getAllPaths(): PathMap;
};

/**
 * Factory function to create a PathManager instance
 * Uses closures for encapsulation instead of classes
 *
 * @param config - Configuration for the PathManager
 * @returns PathManager instance
 *
 * @example
 * ```typescript
 * const pathManager = createPathManager({
 *   context: 'production',
 *   appName: 'Atomiton'
 * });
 *
 * const flowPath = pathManager.getFlowPath('my-flow');
 * await pathManager.ensureDirectory(flowPath);
 * ```
 */
export function createPathManager(
  config: PathManagerConfig = { context: "production" },
): PathManager {
  const appName = config.appName || "Atomiton";
  const context = config.context;

  const basePaths = initializePaths(
    context,
    appName,
    config.testId,
    config.electronApp,
  );

  if (config.overrides) {
    Object.assign(basePaths, config.overrides);
  }

  /**
   * Initialize paths based on context
   * Private helper function
   */
  function initializePaths(
    ctx: PathContext,
    appName: string,
    testId?: string,
    electronApp?: { getPath: (name: ElectronPathName) => string },
  ): PathMap {
    if (ctx === "test") {
      const testRoot = path.join(
        os.tmpdir(),
        "atomiton-test",
        testId || `${Date.now()}-${process.pid}`,
      );
      return {
        userData: testRoot,
        documents: path.join(testRoot, "documents"),
        temp: path.join(testRoot, "temp"),
        logs: path.join(testRoot, "logs"),
        workspaces: path.join(testRoot, "workspaces"),
        flows: path.join(testRoot, "flows"),
        nodePackages: path.join(testRoot, "node-packages"),
        templates: path.join(testRoot, "templates"),
        exports: path.join(testRoot, "exports"),
        config: path.join(testRoot, "config"),
        database: path.join(testRoot, "database"),
      };
    }

    if (ctx === "development") {
      // Use Electron's app.getPath if available, otherwise use fallbacks
      const userDataBase = electronApp
        ? electronApp.getPath("userData")
        : path.join(os.homedir(), ".atomiton-dev");
      const documentsBase = electronApp
        ? electronApp.getPath("documents")
        : path.join(os.homedir(), "Documents");

      const userData = path.join(userDataBase, "Dev");
      const documents = path.join(documentsBase, `${appName}Dev`);

      return {
        userData,
        documents,
        temp: electronApp ? electronApp.getPath("temp") : os.tmpdir(),
        logs: path.join(userData, "logs"),
        workspaces: path.join(userData, "workspaces"),
        flows: path.join(documents, "flows"),
        nodePackages: path.join(userData, "node-packages"),
        templates: path.join(userData, "templates"),
        exports: path.join(documents, "exports"),
        config: path.join(userData, "config"),
        database: path.join(userData, "database"),
      };
    }

    const userData = electronApp
      ? electronApp.getPath("userData")
      : path.join(os.homedir(), ".atomiton");
    const documents = electronApp
      ? path.join(electronApp.getPath("documents"), appName)
      : path.join(os.homedir(), "Documents", appName);
    const logsPath = electronApp
      ? electronApp.getPath("logs")
      : path.join(userData, "logs");

    return {
      userData,
      documents,
      temp: electronApp ? electronApp.getPath("temp") : os.tmpdir(),
      logs: logsPath,
      workspaces: path.join(userData, "workspaces"),
      flows: path.join(documents, "flows"),
      nodePackages: path.join(userData, "node-packages"),
      templates: path.join(userData, "templates"),
      exports: path.join(documents, "exports"),
      config: path.join(userData, "config"),
      database: path.join(userData, "database"),
    };
  }

  /**
   * Sanitize a path component to prevent traversal attacks
   * Private helper function
   */
  function sanitizePathComponent(component: string): string {
    // Remove any path traversal attempts and invalid characters
    return component
      .replace(/^\.+/g, "_") // Replace all leading dots with single underscore (do this first)
      .replace(/\.\./g, "__") // Replace .. with __ (double underscore)
      .replace(/\//g, "_") // Replace / with _ to prevent path traversal
      .replace(/\\/g, "_") // Replace \ with _ to prevent path traversal on Windows
      .replace(/[<>:"|?*]/g, "_") // Replace invalid filename chars
      .trim();
  }

  return {
    getUserDataPath: () => basePaths.userData,

    getLogsPath: () => basePaths.logs,

    getTempPath: () => basePaths.temp,

    getWorkspacePath: (workspaceId: string) =>
      path.join(basePaths.workspaces, sanitizePathComponent(workspaceId)),

    getFlowsDirectory: (workspaceId?: string) => {
      if (workspaceId) {
        return path.join(
          basePaths.workspaces,
          sanitizePathComponent(workspaceId),
          "flows",
        );
      }
      return basePaths.flows;
    },

    getFlowPath: (flowId: string, workspaceId?: string) => {
      const flowsDir = workspaceId
        ? path.join(
            basePaths.workspaces,
            sanitizePathComponent(workspaceId),
            "flows",
          )
        : basePaths.flows;
      return path.join(flowsDir, `${sanitizePathComponent(flowId)}.flow.yaml`);
    },

    getConfigPath: (configName: string) =>
      path.join(basePaths.config, sanitizePathComponent(configName)),

    getDatabasePath: (dbName: string) =>
      path.join(basePaths.database, sanitizePathComponent(dbName)),

    getExportPath: (filename: string) =>
      path.join(basePaths.exports, sanitizePathComponent(filename)),

    ensureDirectory: async (dirPath: string): Promise<void> => {
      await fs.mkdir(dirPath, { recursive: true });
    },

    sanitizePath: sanitizePathComponent,

    getContext: () => context,

    getAllPaths: () => ({ ...basePaths }),
  };
}
