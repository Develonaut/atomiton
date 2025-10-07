import { describe, it, expect, beforeEach } from "vitest";
import { createPathManager } from "#paths/createPathManager";
import type {
  PathManager,
  ElectronPathName,
  PathContext,
} from "#paths/createPathManager";

describe("createPathManager - type safety", () => {
  let pathManager: PathManager;

  beforeEach(() => {
    pathManager = createPathManager({
      context: "test",
      testId: "type-safety-test",
    });
  });

  describe("ElectronPathName type", () => {
    it("should accept valid Electron path names through electronApp.getPath", () => {
      // This is a compile-time test primarily, but we can verify runtime behavior
      const validPathNames: ElectronPathName[] = [
        "home",
        "appData",
        "userData",
        "sessionData",
        "temp",
        "exe",
        "module",
        "desktop",
        "documents",
        "downloads",
        "music",
        "pictures",
        "videos",
        "recent",
        "logs",
        "crashDumps",
      ];

      const mockGetPath = (name: ElectronPathName): string => {
        // Verify the type constraint works
        expect(validPathNames).toContain(name);
        return `/mock/${name}`;
      };

      // Create PathManager with mock Electron app
      const pm = createPathManager({
        context: "production",
        electronApp: {
          getPath: mockGetPath,
        },
      });

      // Verify it was created successfully
      expect(pm).toBeDefined();
      expect(pm.getUserDataPath()).toBeDefined();
    });

    it("should use electronApp.getPath for production context", () => {
      const mockPaths = new Map<ElectronPathName, string>([
        ["userData", "/Users/Test/.atomiton"],
        ["documents", "/Users/Test/Documents"],
        ["temp", "/tmp"],
        ["logs", "/Users/Test/.atomiton/logs"],
      ]);

      const mockGetPath = (name: ElectronPathName): string => {
        return mockPaths.get(name) || `/mock/${name}`;
      };

      const pm = createPathManager({
        context: "production",
        appName: "Atomiton",
        electronApp: {
          getPath: mockGetPath,
        },
      });

      const paths = pm.getAllPaths();

      expect(paths.userData).toBe("/Users/Test/.atomiton");
      expect(paths.temp).toBe("/tmp");
    });

    it("should use electronApp.getPath for development context", () => {
      const mockPaths = new Map<ElectronPathName, string>([
        ["userData", "/Users/Test/.atomiton-dev"],
        ["documents", "/Users/Test/Documents"],
        ["temp", "/tmp"],
      ]);

      const mockGetPath = (name: ElectronPathName): string => {
        return mockPaths.get(name) || `/mock/${name}`;
      };

      const pm = createPathManager({
        context: "development",
        appName: "Atomiton",
        electronApp: {
          getPath: mockGetPath,
        },
      });

      const paths = pm.getAllPaths();

      expect(paths.userData).toContain("Dev");
      expect(paths.temp).toBe("/tmp");
    });

    it("should fall back to os.homedir when electronApp not provided", () => {
      const pm = createPathManager({
        context: "production",
        appName: "Atomiton",
      });

      const paths = pm.getAllPaths();

      // Should use fallback paths
      expect(paths.userData).toBeDefined();
      expect(paths.documents).toBeDefined();
      expect(paths.temp).toBeDefined();
    });
  });

  describe("PathManager interface", () => {
    it("should implement all required methods", () => {
      // Type-level verification that PathManager has all required methods
      const methods: (keyof PathManager)[] = [
        "getUserDataPath",
        "getLogsPath",
        "getTempPath",
        "getWorkspacePath",
        "getFlowsDirectory",
        "getFlowPath",
        "getConfigPath",
        "getDatabasePath",
        "getExportPath",
        "ensureDirectory",
        "sanitizePath",
        "getContext",
        "getAllPaths",
      ];

      methods.forEach((method) => {
        expect(pathManager[method]).toBeDefined();
        expect(typeof pathManager[method]).toBe("function");
      });
    });

    it("should return correct types for getter methods", () => {
      // Runtime type checking
      expect(typeof pathManager.getUserDataPath()).toBe("string");
      expect(typeof pathManager.getLogsPath()).toBe("string");
      expect(typeof pathManager.getTempPath()).toBe("string");
      expect(typeof pathManager.getWorkspacePath("test")).toBe("string");
      expect(typeof pathManager.getFlowsDirectory()).toBe("string");
      expect(typeof pathManager.getFlowPath("test")).toBe("string");
      expect(typeof pathManager.getConfigPath("test")).toBe("string");
      expect(typeof pathManager.getDatabasePath("test")).toBe("string");
      expect(typeof pathManager.getExportPath("test")).toBe("string");
      expect(typeof pathManager.sanitizePath("test")).toBe("string");
      expect(["test", "development", "production"]).toContain(
        pathManager.getContext(),
      );
    });

    it("should return PathMap object from getAllPaths", () => {
      const paths = pathManager.getAllPaths();

      expect(paths).toHaveProperty("userData");
      expect(paths).toHaveProperty("documents");
      expect(paths).toHaveProperty("temp");
      expect(paths).toHaveProperty("logs");
      expect(paths).toHaveProperty("workspaces");
      expect(paths).toHaveProperty("flows");
      expect(paths).toHaveProperty("nodePackages");
      expect(paths).toHaveProperty("templates");
      expect(paths).toHaveProperty("exports");
      expect(paths).toHaveProperty("config");
      expect(paths).toHaveProperty("database");

      // Verify all values are strings
      Object.values(paths).forEach((path) => {
        expect(typeof path).toBe("string");
      });
    });

    it("should return Promise<void> for ensureDirectory", async () => {
      const result = pathManager.ensureDirectory(pathManager.getUserDataPath());

      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBeUndefined();
    });
  });

  describe("PathContext type", () => {
    it("should accept only valid context values", () => {
      const validContexts: Array<"test" | "development" | "production"> = [
        "test",
        "development",
        "production",
      ];

      validContexts.forEach((context) => {
        const pm = createPathManager({ context });
        expect(pm.getContext()).toBe(context);
      });
    });

    it("should return correct context from getContext", () => {
      const testPM = createPathManager({ context: "test" });
      const devPM = createPathManager({ context: "development" });
      const prodPM = createPathManager({ context: "production" });

      expect(testPM.getContext()).toBe("test");
      expect(devPM.getContext()).toBe("development");
      expect(prodPM.getContext()).toBe("production");
    });
  });

  describe("PathManagerConfig type", () => {
    it("should work with minimal config", () => {
      const pm = createPathManager({
        context: "test",
      });

      expect(pm).toBeDefined();
      expect(pm.getContext()).toBe("test");
    });

    it("should work with full config", () => {
      const pm = createPathManager({
        context: "production",
        appName: "CustomApp",
        testId: "test-123",
        overrides: {
          userData: "/custom/userData",
        },
        electronApp: {
          getPath: (name: ElectronPathName) => `/electron/${name}`,
        },
      });

      expect(pm).toBeDefined();
      expect(pm.getContext()).toBe("production");
      expect(pm.getUserDataPath()).toBe("/custom/userData"); // Override applied
    });

    it("should apply path overrides", () => {
      const pm = createPathManager({
        context: "test",
        overrides: {
          userData: "/custom/user",
          documents: "/custom/docs",
          flows: "/custom/flows",
        },
      });

      const paths = pm.getAllPaths();

      expect(paths.userData).toBe("/custom/user");
      expect(paths.documents).toBe("/custom/docs");
      expect(paths.flows).toBe("/custom/flows");
    });
  });

  describe("type exports", () => {
    it("should export all necessary types", () => {
      // Compile-time check that types are exported
      const pm = {} as PathManager;
      const epn = "home" as ElectronPathName;
      const pc = "test" as PathContext;

      // If this compiles, the types are properly exported
      expect(pm).toBeDefined();
      expect(epn).toBeDefined();
      expect(pc).toBeDefined();
    });
  });
});
