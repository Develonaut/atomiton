import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createPathManager } from "#paths/createPathManager";
import type { PathManager } from "#paths/createPathManager";
import fs from "fs/promises";

describe("createPathManager - paths", () => {
  let pathManager: PathManager;
  let testRoot: string;

  beforeEach(() => {
    pathManager = createPathManager({
      context: "test",
      testId: "paths-test",
    });
    testRoot = pathManager.getUserDataPath();
  });

  afterEach(async () => {
    try {
      await fs.rm(testRoot, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe("workspace paths", () => {
    it("should create unique paths for different workspaces", () => {
      const workspace1 = pathManager.getWorkspacePath("workspace-1");
      const workspace2 = pathManager.getWorkspacePath("workspace-2");

      expect(workspace1).not.toBe(workspace2);
      expect(workspace1).toContain("workspace-1");
      expect(workspace2).toContain("workspace-2");
    });

    it("should return workspace-specific flow directory", () => {
      const flowsDir = pathManager.getFlowsDirectory("my-workspace");

      expect(flowsDir).toContain("my-workspace");
      expect(flowsDir).toContain("flows");
    });

    it("should return global flow directory when no workspace specified", () => {
      const flowsDir = pathManager.getFlowsDirectory();

      expect(flowsDir).not.toContain("workspaces");
      expect(flowsDir).toContain("flows");
    });
  });

  describe("flow paths", () => {
    it("should generate flow path with .flow.yaml extension", () => {
      const flowPath = pathManager.getFlowPath("my-flow");

      expect(flowPath).toMatch(/\.flow\.yaml$/);
      expect(flowPath).toContain("my-flow");
    });

    it("should generate workspace-specific flow path", () => {
      const flowPath = pathManager.getFlowPath("my-flow", "workspace-1");

      expect(flowPath).toContain("workspace-1");
      expect(flowPath).toContain("my-flow.flow.yaml");
    });
  });

  describe("config and database paths", () => {
    it("should generate config path", () => {
      const configPath = pathManager.getConfigPath("app.json");
      expect(configPath).toContain("config");
      expect(configPath).toContain("app.json");
    });

    it("should generate database path", () => {
      const dbPath = pathManager.getDatabasePath("flows.db");
      expect(dbPath).toContain("database");
      expect(dbPath).toContain("flows.db");
    });

    it("should generate export path", () => {
      const exportPath = pathManager.getExportPath("flow-export.zip");
      expect(exportPath).toContain("exports");
      expect(exportPath).toContain("flow-export.zip");
    });
  });

  describe("getAllPaths", () => {
    it("should return all managed paths", () => {
      const allPaths = pathManager.getAllPaths();

      expect(allPaths).toHaveProperty("userData");
      expect(allPaths).toHaveProperty("documents");
      expect(allPaths).toHaveProperty("temp");
      expect(allPaths).toHaveProperty("logs");
      expect(allPaths).toHaveProperty("workspaces");
      expect(allPaths).toHaveProperty("flows");
      expect(allPaths).toHaveProperty("nodePackages");
      expect(allPaths).toHaveProperty("templates");
      expect(allPaths).toHaveProperty("exports");
      expect(allPaths).toHaveProperty("config");
      expect(allPaths).toHaveProperty("database");
    });

    it("should return a copy of paths (not internal reference)", () => {
      const paths1 = pathManager.getAllPaths();
      const paths2 = pathManager.getAllPaths();

      expect(paths1).not.toBe(paths2); // Different objects
      expect(paths1).toEqual(paths2); // But same values
    });
  });

  describe("path overrides", () => {
    it("should apply path overrides", () => {
      const pm = createPathManager({
        context: "test",
        testId: "override-test",
        overrides: {
          flows: "/custom/flows/path",
          config: "/custom/config/path",
        },
      });

      const allPaths = pm.getAllPaths();
      expect(allPaths.flows).toBe("/custom/flows/path");
      expect(allPaths.config).toBe("/custom/config/path");
    });
  });
});
