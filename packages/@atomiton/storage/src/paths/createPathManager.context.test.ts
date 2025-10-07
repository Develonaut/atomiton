import { describe, it, expect } from "vitest";
import { createPathManager } from "#paths/createPathManager";
import os from "os";

describe("createPathManager - context", () => {
  describe("test context", () => {
    it("should use temp directory in test mode", () => {
      const pathManager = createPathManager({
        context: "test",
        testId: `test-${Date.now()}`,
      });
      const userDataPath = pathManager.getUserDataPath();
      expect(userDataPath).toContain(os.tmpdir());
      expect(userDataPath).toContain("atomiton-test");
    });

    it("should include testId in path", () => {
      const testId = "my-unique-test";
      const pm = createPathManager({
        context: "test",
        testId,
      });
      expect(pm.getUserDataPath()).toContain(testId);
    });

    it("should generate unique path when no testId provided", async () => {
      const pm1 = createPathManager({ context: "test" });

      // Add small delay to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 2));

      const pm2 = createPathManager({ context: "test" });

      // Paths should be different due to timestamp and PID
      expect(pm1.getUserDataPath()).not.toBe(pm2.getUserDataPath());
    });

    it("should return correct context", () => {
      const pathManager = createPathManager({
        context: "test",
        testId: "context-test",
      });
      expect(pathManager.getContext()).toBe("test");
    });
  });

  describe("development context", () => {
    it("should use dev-specific paths", () => {
      const mockElectronApp = {
        getPath: (name: string) => {
          const paths: Record<string, string> = {
            userData: "/mock/userData",
            documents: "/mock/documents",
            temp: "/mock/temp",
          };
          return paths[name] || "/mock/default";
        },
      };

      const pm = createPathManager({
        context: "development",
        appName: "Atomiton",
        electronApp: mockElectronApp,
      });

      expect(pm.getUserDataPath()).toContain("Dev");
      expect(pm.getContext()).toBe("development");
    });
  });

  describe("production context", () => {
    it("should use production paths", () => {
      const mockElectronApp = {
        getPath: (name: string) => {
          const paths: Record<string, string> = {
            userData: "/mock/userData",
            documents: "/mock/documents",
            temp: "/mock/temp",
            logs: "/mock/logs",
          };
          return paths[name] || "/mock/default";
        },
      };

      const pm = createPathManager({
        context: "production",
        appName: "Atomiton",
        electronApp: mockElectronApp,
      });

      expect(pm.getUserDataPath()).toBe("/mock/userData");
      expect(pm.getContext()).toBe("production");
    });
  });
});
