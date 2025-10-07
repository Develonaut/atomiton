# Electron File Path Management Strategy

## Problem Statement

The current codebase has file path management scattered across multiple
locations, leading to:

1. **Inconsistent Path Handling**: Different parts of the application use
   different approaches to determine file paths
2. **Platform-Specific Issues**: Hard-coded paths that work on one OS but fail
   on others
3. **Testing Challenges**: Difficulty mocking file paths in tests, leading to
   brittle test suites
4. **Security Concerns**: Potential path traversal vulnerabilities when paths
   are constructed ad-hoc
5. **User Data Inconsistency**: No clear strategy for where different types of
   data should be stored
6. **Maintenance Burden**: Changes to path logic require updates in multiple
   places

Current problematic patterns observed:

- Direct use of `app.getPath()` scattered throughout the codebase
- Manual path concatenation using string operations
- No abstraction layer for testing environments
- Inconsistent handling of workspace vs application data

## Solution Overview

Implement a **centralized PathManager service** that:

1. Provides a single source of truth for all file paths
2. Abstracts Electron's path APIs behind a testable interface
3. Enforces consistent path construction patterns
4. Handles platform differences automatically
5. Supports different environments (development, production, testing)
6. Provides type-safe path access through well-defined methods

### Core Principles

- **Single Responsibility**: One service manages all paths
- **Dependency Injection**: PathManager can be mocked for testing
- **Type Safety**: All paths are accessed through typed methods
- **Platform Agnostic**: Handles OS differences transparently
- **Environment Aware**: Different behaviors for dev/prod/test

## Electron Path APIs Summary

### Core Path Types and Usage

| Path Type     | Electron API               | Use Case                                       | Example Location                                     |
| ------------- | -------------------------- | ---------------------------------------------- | ---------------------------------------------------- |
| **userData**  | `app.getPath('userData')`  | App configuration, databases, user preferences | `~/Library/Application Support/Atomiton` (macOS)     |
| **documents** | `app.getPath('documents')` | User-created content, exported files           | `~/Documents`                                        |
| **temp**      | `app.getPath('temp')`      | Temporary files, caches that can be deleted    | `/tmp` or `%TEMP%`                                   |
| **logs**      | `app.getPath('logs')`      | Application logs, debug output                 | `~/Library/Logs/Atomiton` (macOS)                    |
| **appData**   | `app.getPath('appData')`   | Roaming application data                       | `~/Library/Application Support` (macOS)              |
| **desktop**   | `app.getPath('desktop')`   | User's desktop for shortcuts/exports           | `~/Desktop`                                          |
| **downloads** | `app.getPath('downloads')` | Default download location                      | `~/Downloads`                                        |
| **home**      | `app.getPath('home')`      | User's home directory                          | `~`                                                  |
| **exe**       | `app.getPath('exe')`       | Path to the executable                         | `/Applications/Atomiton.app/Contents/MacOS/Atomiton` |

### Best Practices for Path Selection

1. **User Data & Settings**: Always use `userData`
   - Database files (SQLite, LevelDB)
   - User preferences/settings
   - License keys
   - Application state

2. **User-Created Content**: Use `documents` with app subfolder
   - Exported flows
   - Generated reports
   - Project files

3. **Temporary Files**: Use `temp`
   - Build artifacts
   - Processing intermediates
   - Download staging

4. **Logs**: Use `logs`
   - Debug logs
   - Error reports
   - Audit trails

5. **Never Use**:
   - Hard-coded absolute paths
   - Relative paths from `__dirname` for user data
   - Current working directory assumptions

## Architecture Design

### Package Location

**PathManager belongs in `@atomiton/storage`** because:

- Storage owns file persistence and serialization
- Storage already manages base directories (see `createFileSystemStorage`)
- "Where files live" is fundamentally a storage concern
- Keeps file-related concerns colocated
- Avoids creating unnecessary packages

### PathManager Service Structure

```typescript
// packages/@atomiton/storage/src/paths/PathManager.ts

export type PathManager = {
  // Core application paths
  getUserDataPath(): string;
  getLogsPath(): string;
  getTempPath(): string;

  // Workspace management
  getWorkspacesRoot(): string;
  getWorkspacePath(workspaceId: string): string;
  getCurrentWorkspacePath(): string;

  // Flow storage
  getFlowsDirectory(workspaceId?: string): string;
  getFlowPath(flowId: string, workspaceId?: string): string;

  // Node packages
  getNodePackagesPath(): string;
  getNodePackagePath(packageName: string): string;

  // Templates and examples
  getTemplatesPath(): string;
  getExamplesPath(): string;

  // Export/Import
  getExportPath(filename: string): string;
  getImportStagingPath(): string;

  // Database
  getDatabasePath(dbName: string): string;

  // Configuration
  getConfigPath(configName: string): string;

  // Utilities
  ensureDirectory(path: string): Promise<void>;
  resolveRelativePath(base: string, relative: string): string;
  isPathAccessible(path: string): Promise<boolean>;
};
```

### Directory Structure

```
~/Library/Application Support/Atomiton/  (userData)
├── config/
│   ├── app.json
│   └── preferences.json
├── workspaces/
│   ├── default/
│   │   ├── flows/
│   │   │   ├── flow1.yaml
│   │   │   └── flow2.yaml
│   │   └── metadata.json
│   └── project-x/
│       ├── flows/
│       └── metadata.json
├── node-packages/
│   ├── @atomiton/nodes-core/
│   └── custom-nodes/
├── databases/
│   ├── app.db
│   └── cache.db
└── templates/
    └── examples/

~/Documents/Atomiton/  (documents)
├── exports/
│   └── flow-export-2024-01-15.zip
└── imports/

~/Library/Logs/Atomiton/  (logs)
├── main.log
├── renderer.log
└── error.log
```

### Environment Configuration

```typescript
// Environment-aware path resolution using functional patterns
export type PathContext = "development" | "test" | "production";

export type PathManagerConfig = {
  context: PathContext;
  appName?: string;
  testId?: string;
  overrides?: Partial<Record<string, string>>;
};

function resolveBasePath(context: PathContext, appName: string): string {
  switch (context) {
    case "test":
      return path.join(os.tmpdir(), "atomiton-test");
    case "development":
      return path.join(app.getPath("userData"), `${appName}-Dev`);
    case "production":
      return app.getPath("userData");
  }
}
```

## Implementation Details

### 1. PathManager Location

PathManager will be added to the existing `@atomiton/storage` package:

- `packages/@atomiton/storage/src/paths/` - New directory for path management
- Export from `@atomiton/storage` package
- Update package.json exports to include paths

### 2. PathManager Implementation (Functional Pattern)

```typescript
// packages/@atomiton/storage/src/paths/createPathManager.ts
import { app } from "electron";
import path from "path";
import fs from "fs/promises";
import os from "os";

export type PathContext = "development" | "test" | "production";

export type PathManagerConfig = {
  context: PathContext;
  appName?: string;
  testId?: string;
  overrides?: Partial<Record<string, string>>;
};

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

export type PathManager = {
  getUserDataPath(): string;
  getLogsPath(): string;
  getTempPath(): string;
  getWorkspacePath(workspaceId: string): string;
  getFlowsDirectory(workspaceId?: string): string;
  getFlowPath(flowId: string, workspaceId?: string): string;
  getConfigPath(configName: string): string;
  getDatabasePath(dbName: string): string;
  getExportPath(filename: string): string;
  ensureDirectory(dirPath: string): Promise<void>;
  sanitizePath(component: string): string;
  getContext(): PathContext;
  getAllPaths(): PathMap;
};

/**
 * Factory function to create a PathManager instance
 * Uses closures for encapsulation instead of classes
 */
export function createPathManager(
  config: PathManagerConfig = { context: "production" },
): PathManager {
  const appName = config.appName || "Atomiton";
  const context = config.context;

  // Initialize base paths in closure (private state)
  const basePaths = initializePaths(context, appName, config.testId);

  // Apply overrides if provided
  if (config.overrides) {
    Object.assign(basePaths, config.overrides);
  }

  // Private helper function
  function initializePaths(
    ctx: PathContext,
    appName: string,
    testId?: string,
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
      const userData = path.join(app.getPath("userData"), "Dev");
      const documents = path.join(app.getPath("documents"), `${appName}Dev`);
      return {
        userData,
        documents,
        temp: app.getPath("temp"),
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

    // Production
    const userData = app.getPath("userData");
    const documents = path.join(app.getPath("documents"), appName);
    return {
      userData,
      documents,
      temp: app.getPath("temp"),
      logs: app.getPath("logs"),
      workspaces: path.join(userData, "workspaces"),
      flows: path.join(documents, "flows"),
      nodePackages: path.join(userData, "node-packages"),
      templates: path.join(userData, "templates"),
      exports: path.join(documents, "exports"),
      config: path.join(userData, "config"),
      database: path.join(userData, "database"),
    };
  }

  // Private helper for path sanitization
  function sanitizePathComponent(component: string): string {
    return component.replace(/[^a-zA-Z0-9-_\.]/g, "_").replace(/\.\./g, "_");
  }

  // Return public API
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
      return path.join(flowsDir, `${sanitizePathComponent(flowId)}.yaml`);
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
```

### 3. Integration with Main Process

```typescript
// apps/desktop/src/main/index.ts
import { createPathManager } from "@atomiton/storage/paths";

// Create PathManager singleton during app initialization
let pathManager: PathManager;

app.on("ready", () => {
  const isDev = process.env.NODE_ENV === "development";
  const isTest = process.env.NODE_ENV === "test";

  pathManager = createPathManager({
    context: isTest ? "test" : isDev ? "development" : "production",
    appName: "Atomiton",
    testId: process.env.TEST_ID,
  });

  // Initialize other services that need paths
  initializeServices(pathManager);
});

// Export for use in IPC handlers
export function getPathManager(): PathManager {
  if (!pathManager) {
    throw new Error("PathManager not initialized");
  }
  return pathManager;
}
```

### 4. IPC Handlers for Path Access

```typescript
// apps/desktop/src/main/ipc/pathHandlers.ts
import { ipcMain } from "electron";
import { getPathManager } from "../index";

export function registerPathHandlers(): void {
  const pathManager = getPathManager();

  ipcMain.handle("path:get-workspace", (_, workspaceId: string) => {
    return pathManager.getWorkspacePath(workspaceId);
  });

  ipcMain.handle("path:get-flows-dir", (_, workspaceId?: string) => {
    return pathManager.getFlowsDirectory(workspaceId);
  });

  ipcMain.handle("path:get-user-data", () => {
    return pathManager.getUserDataPath();
  });

  ipcMain.handle("path:ensure-directory", async (_, dirPath: string) => {
    await pathManager.ensureDirectory(dirPath);
  });
}
```

### 5. Renderer Process Access

```typescript
// apps/desktop/src/preload/api/paths.ts
import { contextBridge, ipcRenderer } from "electron";

export const pathsAPI = {
  getWorkspacePath: (id: string) =>
    ipcRenderer.invoke("path:get-workspace", id),
  getFlowsDirectory: (workspaceId?: string) =>
    ipcRenderer.invoke("path:get-flows-dir", workspaceId),
  getUserDataPath: () => ipcRenderer.invoke("path:get-user-data"),
  ensureDirectory: (path: string) =>
    ipcRenderer.invoke("path:ensure-directory", path),
};

// In preload/index.ts
contextBridge.exposeInMainWorld("atomiton", {
  paths: pathsAPI,
});
```

## Testing Strategy

### 1. Unit Tests with Functional PathManager

```typescript
// packages/@atomiton/storage/src/paths/createPathManager.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createPathManager } from "./createPathManager";
import os from "os";
import fs from "fs/promises";

describe("createPathManager", () => {
  let pathManager: ReturnType<typeof createPathManager>;
  let testRoot: string;

  beforeEach(() => {
    pathManager = createPathManager({
      context: "test",
      testId: `test-${Date.now()}`,
    });
    testRoot = pathManager.getUserDataPath();
  });

  afterEach(async () => {
    // Cleanup test directories
    try {
      await fs.rm(testRoot, { recursive: true, force: true });
    } catch (err) {
      // Ignore cleanup errors
    }
  });

  it("should use temp directory in test mode", () => {
    const userDataPath = pathManager.getUserDataPath();
    expect(userDataPath).toContain(os.tmpdir());
    expect(userDataPath).toContain("atomiton-test");
  });

  it("should sanitize workspace IDs to prevent path traversal", () => {
    const maliciousId = "../../../etc/passwd";
    const safePath = pathManager.getWorkspacePath(maliciousId);
    expect(safePath).not.toContain("..");
    expect(safePath).toContain("___etc_passwd");
  });

  it("should create unique paths for different workspaces", () => {
    const workspace1 = pathManager.getWorkspacePath("workspace-1");
    const workspace2 = pathManager.getWorkspacePath("workspace-2");
    expect(workspace1).not.toBe(workspace2);
  });

  it("should create directories when requested", async () => {
    const testDir = pathManager.getWorkspacePath("test-workspace");
    await pathManager.ensureDirectory(testDir);

    const stats = await fs.stat(testDir);
    expect(stats.isDirectory()).toBe(true);
  });
});
```

### 2. Integration Tests

```typescript
// packages/@atomiton/storage/src/__tests__/pathManager.integration.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { createPathManager } from "../paths/createPathManager";
import { createFileSystemStorage } from "../factories/createFileSystemStorage";

describe("PathManager Integration", () => {
  let pathManager: ReturnType<typeof createPathManager>;

  beforeEach(() => {
    pathManager = createPathManager({
      context: "test",
      testId: `integration-${Date.now()}`,
    });
  });

  it("should work with FileSystemStorage", async () => {
    const storage = createFileSystemStorage({
      baseDir: pathManager.getFlowsDirectory(),
    });

    const testFlow = {
      id: "test-flow",
      type: "group",
      nodes: [],
    };

    await storage.save("test-flow", testFlow);
    const loaded = await storage.load("test-flow");

    expect(loaded).toEqual(testFlow);
  });
});
```

### 3. E2E Test Configuration

```typescript
// e2e/fixtures/test-paths.ts
import { createPathManager } from "@atomiton/storage/paths";
import fs from "fs/promises";

export function createTestPathManager(testName: string) {
  return createPathManager({
    context: "test",
    testId: `e2e-${testName}-${Date.now()}`,
  });
}

export async function cleanupTestPaths(
  pathManager: ReturnType<typeof createPathManager>,
) {
  const testRoot = pathManager.getUserDataPath();
  try {
    await fs.rm(testRoot, { recursive: true, force: true });
  } catch (err) {
    console.warn("Failed to cleanup test paths:", err);
  }
}

// Usage in E2E tests
export class TestEnvironment {
  private pathManager: ReturnType<typeof createPathManager>;

  async setup(testName: string) {
    this.pathManager = createTestPathManager(testName);
    await this.pathManager.ensureDirectory(this.pathManager.getUserDataPath());
  }

  async teardown() {
    await cleanupTestPaths(this.pathManager);
  }

  getPathManager() {
    return this.pathManager;
  }
}
```

## Migration Impact

### Files to Create

1. **PathManager Module** (in @atomiton/storage):
   - `packages/@atomiton/storage/src/paths/createPathManager.ts` - Factory
     function
   - `packages/@atomiton/storage/src/paths/createPathManager.test.ts` - Unit
     tests
   - `packages/@atomiton/storage/src/paths/index.ts` - Exports

2. **IPC Handlers**:
   - `apps/desktop/src/main/ipc/pathHandlers.ts` - Path-related IPC handlers

3. **Test Utilities**:
   - `e2e/fixtures/test-paths.ts` - E2E test helpers

### Files to Update

1. **Storage Package**:
   - `packages/@atomiton/storage/package.json` - Add new exports for paths
   - `packages/@atomiton/storage/src/index.ts` - Export PathManager
   - `packages/@atomiton/storage/src/factories/createFileSystemStorage.ts` - Use
     PathManager

2. **Main Process Files**:
   - `apps/desktop/src/main/index.ts` - Initialize PathManager
   - `apps/desktop/src/main/services/*` - Replace direct `app.getPath()` calls
   - `apps/desktop/src/main/ipc/index.ts` - Register path handlers

3. **Preload**:
   - `apps/desktop/src/preload/api/paths.ts` - Create paths API
   - `apps/desktop/src/preload/index.ts` - Export paths API

4. **Configuration**:
   - `apps/desktop/src/main/config.ts` - Use PathManager for config paths

5. **Logging** (if exists):
   - `apps/desktop/src/main/logger.ts` - Use PathManager for log paths

### Migration Steps

1. **Phase 1**: Add PathManager to @atomiton/storage package
2. **Phase 2**: Update main process initialization
3. **Phase 3**: Update storage factories to use PathManager
4. **Phase 4**: Create IPC handlers and preload API
5. **Phase 5**: Migrate all direct `app.getPath()` calls
6. **Phase 6**: Add comprehensive tests
7. **Phase 7**: Update documentation

### Breaking Changes

- **None for end users** - File paths remain in the same locations
- **Internal API changes** - Storage factories may accept PathManager
- **Test fixtures** - E2E tests need to use new test path utilities
- **Dependency update** - @atomiton/conductor may depend on @atomiton/storage
  for paths

## Benefits

### 1. **Consistency**

- Single source of truth for all paths
- Consistent path construction across the application
- Platform differences handled automatically

### 2. **Testability**

- Easy to mock for unit tests
- Isolated test environments
- No file system pollution in tests

### 3. **Security**

- Centralized path sanitization
- Protection against path traversal attacks
- Validated path construction

### 4. **Maintainability**

- Changes to path logic in one place
- Clear separation of concerns
- Self-documenting API

### 5. **Developer Experience**

- Type-safe path access
- IntelliSense support
- Clear usage patterns

### 6. **Reliability**

- Automatic directory creation
- Path validation
- Error handling in one place

### 7. **Performance**

- Path caching where appropriate
- Reduced file system calls
- Optimized path resolution

---

## Implementation Prompt

### Task: Implement Centralized Path Management in @atomiton/storage

**Context**: Implement the Electron file path management strategy defined in
`.claude/strategies/electron-file-management-strategy.md`. This adds PathManager
to the existing `@atomiton/storage` package using functional programming
patterns to handle all file system paths consistently across the application.

**Key Architectural Decisions**:

1. **Package Location**: @atomiton/storage (not a new package)
2. **Pattern**: Functional programming with factory functions (not classes)
3. **Philosophy**: Follows ARCHITECTURE.md functional DI patterns

**Implementation Order**:

#### Step 1: Add PathManager to Storage Package

```bash
# Create new paths directory in storage
mkdir -p packages/@atomiton/storage/src/paths
```

Create the following files:

1. **`packages/@atomiton/storage/src/paths/createPathManager.ts`**
   - Implement `createPathManager(config)` factory function
   - Use closures for private state (no classes)
   - Return object with public methods
   - Follow functional pattern from ARCHITECTURE.md
   - Include all methods: getUserDataPath, getWorkspacePath, getFlowPath, etc.
   - Implement path sanitization to prevent traversal attacks
   - Handle test/dev/production contexts

2. **`packages/@atomiton/storage/src/paths/createPathManager.test.ts`**
   - Test all public methods
   - Test path sanitization (prevent `../` attacks)
   - Test different contexts (test, dev, production)
   - Test directory creation
   - Include cleanup in afterEach

3. **`packages/@atomiton/storage/src/paths/index.ts`**
   ```typescript
   export { createPathManager } from "./createPathManager";
   export type {
     PathManager,
     PathManagerConfig,
     PathContext,
     PathMap,
   } from "./createPathManager";
   ```

#### Step 2: Update Storage Package Exports

Update **`packages/@atomiton/storage/package.json`**:

```json
{
  "exports": {
    ".": { ... },
    "./browser": { ... },
    "./desktop": { ... },
    "./paths": {
      "import": "./dist/src/paths/index.js",
      "types": "./dist/src/paths/index.d.ts"
    }
  }
}
```

Update **`packages/@atomiton/storage/src/index.ts`**:

```typescript
export { createPathManager } from "./paths";
export type { PathManager, PathManagerConfig } from "./paths";
```

#### Step 3: Integrate with Main Process

Update **`apps/desktop/src/main/index.ts`**:

```typescript
import { createPathManager, type PathManager } from "@atomiton/storage/paths";

let pathManager: PathManager;

app.on("ready", () => {
  const isDev = process.env.NODE_ENV === "development";
  const isTest = process.env.NODE_ENV === "test";

  pathManager = createPathManager({
    context: isTest ? "test" : isDev ? "development" : "production",
    appName: "Atomiton",
    testId: process.env.TEST_ID,
  });

  // Initialize other services
  initializeServices(pathManager);
});

export function getPathManager(): PathManager {
  if (!pathManager) {
    throw new Error("PathManager not initialized");
  }
  return pathManager;
}
```

#### Step 4: Create IPC Handlers

Create **`apps/desktop/src/main/ipc/pathHandlers.ts`**:

```typescript
import { ipcMain } from "electron";
import { getPathManager } from "../index";

export function registerPathHandlers(): void {
  const pathManager = getPathManager();

  ipcMain.handle("path:get-workspace", (_, workspaceId: string) => {
    return pathManager.getWorkspacePath(workspaceId);
  });

  ipcMain.handle("path:get-flows-dir", (_, workspaceId?: string) => {
    return pathManager.getFlowsDirectory(workspaceId);
  });

  ipcMain.handle("path:get-user-data", () => {
    return pathManager.getUserDataPath();
  });

  ipcMain.handle("path:ensure-directory", async (_, dirPath: string) => {
    await pathManager.ensureDirectory(dirPath);
  });
}
```

Update **`apps/desktop/src/main/ipc/index.ts`** to register handlers.

#### Step 5: Add Preload API

Create **`apps/desktop/src/preload/api/paths.ts`**:

```typescript
import { contextBridge, ipcRenderer } from "electron";

export const pathsAPI = {
  getWorkspacePath: (id: string) =>
    ipcRenderer.invoke("path:get-workspace", id),
  getFlowsDirectory: (workspaceId?: string) =>
    ipcRenderer.invoke("path:get-flows-dir", workspaceId),
  getUserDataPath: () => ipcRenderer.invoke("path:get-user-data"),
  ensureDirectory: (path: string) =>
    ipcRenderer.invoke("path:ensure-directory", path),
};
```

Update **`apps/desktop/src/preload/index.ts`** to expose paths API.

#### Step 6: Migrate Storage to Use PathManager

Update
**`packages/@atomiton/storage/src/factories/createFileSystemStorage.ts`**:

- Add optional `pathManager` parameter to config
- Use pathManager for base directory resolution
- Maintain backward compatibility (baseDir still works)

#### Step 7: Search and Replace Direct Path Usage

Find and replace:

```bash
# Search for direct app.getPath() calls
grep -r "app\.getPath" apps/desktop/src --include="*.ts"

# Search for manual path building
grep -r "__dirname.*userData" apps/desktop/src --include="*.ts"
```

Replace with PathManager method calls.

#### Step 8: Add E2E Test Helpers

Create **`e2e/fixtures/test-paths.ts`**:

```typescript
import { createPathManager } from "@atomiton/storage/paths";
import fs from "fs/promises";

export function createTestPathManager(testName: string) {
  return createPathManager({
    context: "test",
    testId: `e2e-${testName}-${Date.now()}`,
  });
}

export async function cleanupTestPaths(
  pathManager: ReturnType<typeof createPathManager>,
) {
  const testRoot = pathManager.getUserDataPath();
  try {
    await fs.rm(testRoot, { recursive: true, force: true });
  } catch (err) {
    console.warn("Failed to cleanup test paths:", err);
  }
}
```

#### Step 9: Update Conductor (if needed)

If conductor needs paths in ExecutionContext:

- Add `@atomiton/storage` as dependency
- Import PathManager and inject paths into context
- Update ExecutionContext type to include paths

### Validation Steps

After each step, validate:

```bash
# Step 1-2: PathManager in storage
pnpm --filter @atomiton/storage build
pnpm --filter @atomiton/storage test

# Step 3-5: Main process integration
pnpm --filter @atomiton/desktop build
pnpm --filter @atomiton/desktop test

# Step 6-7: Migration validation
# Check for any remaining direct path usage
grep -r "app\.getPath" apps/desktop/src --include="*.ts"
grep -r "path\.join.*__dirname" apps/desktop/src --include="*.ts"

# Step 8: E2E tests
pnpm test:e2e

# Final validation
pnpm build
pnpm test
pnpm typecheck
pnpm --filter @atomiton/desktop dev  # Manual testing
```

### Success Criteria

✅ **Implementation Complete When**:

1. ✅ PathManager uses functional factory pattern (no classes)
2. ✅ PathManager lives in @atomiton/storage package
3. ✅ No direct `app.getPath()` calls outside PathManager
4. ✅ All tests pass (unit, integration, E2E)
5. ✅ Application runs in dev, prod, and test modes
6. ✅ Paths are consistent across all environments
7. ✅ Test environments are isolated and cleaned up properly
8. ✅ No hardcoded paths in the codebase
9. ✅ Type-safe path access throughout
10. ✅ Follows ARCHITECTURE.md functional patterns

### Code Review Checklist

- [ ] PathManager uses factory function pattern (not class/singleton)
- [ ] Uses closures for private state encapsulation
- [ ] Test mode properly isolates file system access
- [ ] Path sanitization prevents traversal attacks (test `../` handling)
- [ ] All paths use Node's `path` module (platform-agnostic)
- [ ] Directory creation handles errors gracefully
- [ ] IPC handlers validate and sanitize inputs
- [ ] Preload API only exposes safe, whitelisted methods
- [ ] Tests clean up directories in afterEach hooks
- [ ] No class-based DI patterns (follow ARCHITECTURE.md)
- [ ] JSDoc comments on all public functions
- [ ] TypeScript strict mode enabled
- [ ] Follows existing @atomiton/storage code style

### Functional Programming Patterns to Follow

From ARCHITECTURE.md:

```typescript
// ✅ DO: Factory function with closures
export function createPathManager(config: PathManagerConfig): PathManager {
  // Private state in closure
  const context = config.context;
  const basePaths = initializePaths(config);

  // Private helper
  function sanitize(path: string): string { ... }

  // Return public API
  return {
    getUserDataPath: () => basePaths.userData,
    getWorkspacePath: (id) => path.join(basePaths.workspaces, sanitize(id)),
  };
}

// ❌ DON'T: Class-based with singleton
class PathManager {
  private static instance: PathManager;
  static getInstance() { ... }
}
```

### Notes for Implementation

- **Follow functional patterns** from ARCHITECTURE.md
- **No classes** - use factory functions and closures
- **Keep it simple** - PathManager is just a factory that returns an object
- Start with PathManager implementation and tests first
- Ensure backward compatibility during migration
- Use TypeScript strict mode for all new files
- Add JSDoc comments for all public methods
- Test path sanitization thoroughly (security critical)

**Reference**: Full strategy document at
`.claude/strategies/electron-file-management-strategy.md`

---

## Prompt for Guilliman

**Guilliman**, we need you to implement the centralized path management system
for Electron following the strategy in
`.claude/strategies/electron-file-management-strategy.md`.

### Your Mission

As the standards guardian who ensures we use the framework's built-in tools
correctly, you're perfect for this task because:

1. **Electron already solved this** - We need to properly use `app.getPath()`
   instead of scattered manual path construction
2. **Everything in its place** - PathManager belongs in `@atomiton/storage`
   (file management is storage's domain)
3. **Standard patterns** - Use functional programming patterns from
   `ARCHITECTURE.md`, not reinventing with classes
4. **TypeScript excellence** - Ensure type safety and proper exports throughout

### Context

**The Problem**: File paths are scattered across the codebase. Flows write to
different locations depending on context (dev/test/prod/Playwright). This makes
debugging impossible because files are everywhere.

**The Solution**: Centralize all path logic in `@atomiton/storage` using a
functional `createPathManager()` factory that:

- Uses Electron's standard `app.getPath()` APIs properly
- Provides one universal location for all flow-related files
- Handles dev/test/prod contexts transparently
- Makes paths predictable and debuggable

### Implementation Requirements

#### 1. Package Location (Master of Codex TypeScript)

- **Add to existing `@atomiton/storage`** package (DON'T create new package)
- Path management is a storage concern ("where files live")
- Follows architecture: storage owns file persistence and locations

#### 2. Pattern Requirements (Framework Standards)

- **Use functional factory pattern** from `ARCHITECTURE.md`
- Factory function with closures (NOT classes/singletons)
- Dependency injection via function parameters
- No class-based patterns - follow existing codebase functional style

#### 3. Implementation Steps

Follow these steps IN ORDER (reference full details in the Implementation Prompt
section above):

1. **Create PathManager in Storage** (`packages/@atomiton/storage/src/paths/`)
   - `createPathManager.ts` - Factory function using closures
   - `createPathManager.test.ts` - Unit tests with path sanitization tests
   - `index.ts` - Clean exports

2. **Update Storage Package Exports**
   - Add `./paths` export to package.json
   - Export from main index

3. **Integrate with Main Process**
   - Initialize in `apps/desktop/src/main/index.ts`
   - Use environment variables for context (dev/test/prod)

4. **Create IPC Layer**
   - IPC handlers in `apps/desktop/src/main/ipc/pathHandlers.ts`
   - Preload API in `apps/desktop/src/preload/api/paths.ts`

5. **Migrate Existing Code**
   - Search for `app.getPath()` calls - replace with PathManager
   - Update storage factories to use PathManager
   - Ensure backward compatibility

6. **Testing**
   - Unit tests for all PathManager methods
   - Integration tests with storage
   - E2E test helpers for isolated test environments
   - Test path sanitization (security critical: prevent `../` attacks)

7. **Validation**
   - Run all builds and tests
   - Verify no direct `app.getPath()` outside PathManager
   - Check type safety throughout

### Key Architectural Principles

**The Framework Already Solved This:**

- ✅ Use Electron's `app.getPath('userData')` for app data
- ✅ Use `app.getPath('documents')` for user-created flows
- ✅ Use `app.getPath('temp')` for temporary files
- ✅ Use `app.getPath('logs')` for logs

**Everything in Its Place:**

- ✅ PathManager lives in `@atomiton/storage` (file locations are storage's
  domain)
- ✅ One factory creates all path instances
- ✅ Closures for private state (no classes)
- ✅ Type-safe exports from storage package

**Standard Tools, Standard Patterns:**

- ✅ Functional factory: `createPathManager(config)`
- ✅ Dependency injection via parameters (not decorators)
- ✅ TypeScript strict mode
- ✅ Platform-agnostic using Node's `path` module

### Success Criteria

You'll know you're done when:

1. ✅ PathManager uses functional factory pattern (no classes)
2. ✅ Lives in `@atomiton/storage/src/paths/`
3. ✅ No `app.getPath()` calls outside PathManager
4. ✅ All tests pass (unit, integration, E2E)
5. ✅ Paths work in dev, test, and production
6. ✅ Test environments are isolated (each test gets unique temp dir)
7. ✅ Type-safe throughout (strict TypeScript)
8. ✅ Follows ARCHITECTURE.md functional patterns
9. ✅ Path sanitization prevents security issues
10. ✅ One universal location for flow files (easy debugging)

### Code Review Focus

As the TypeScript master, ensure:

- [ ] Factory function pattern (reference ARCHITECTURE.md)
- [ ] Closures for encapsulation (not classes)
- [ ] Path sanitization prevents `../` traversal
- [ ] Platform-agnostic (use `path.join`, not string concat)
- [ ] Proper TypeScript exports from storage package
- [ ] IPC handlers validate all inputs
- [ ] Tests clean up temp directories
- [ ] JSDoc on all public functions
- [ ] No reinvented wheels (use Electron's built-in APIs)

### Reference Documents

1. **`.claude/strategies/electron-file-management-strategy.md`** - This document
   (full strategy)
2. **`.claude/ARCHITECTURE.md`** - Functional programming patterns and package
   boundaries
3. **Implementation Prompt section above** - Step-by-step implementation guide

### Expected Output

When complete, you should provide:

1. ✅ Summary of what was implemented
2. ✅ List of files created/modified
3. ✅ Validation results (all tests passing)
4. ✅ Instructions for using PathManager in flows/nodes
5. ✅ Any architectural decisions made during implementation

**Guilliman, the framework already solved this - let's use it properly.
Everything in its place.**
