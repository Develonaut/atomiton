import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createPathManager } from "#paths/createPathManager";
import type { PathManager } from "#paths/createPathManager";
import fs from "fs/promises";

describe("createPathManager - sanitization", () => {
  let pathManager: PathManager;
  let testRoot: string;

  beforeEach(() => {
    pathManager = createPathManager({
      context: "test",
      testId: "sanitization-test",
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

  it("should sanitize workspace IDs to prevent path traversal", () => {
    const maliciousId = "../../../etc/passwd";
    const safePath = pathManager.getWorkspacePath(maliciousId);

    expect(safePath).not.toContain("..");
    expect(safePath).toContain("_____etc_passwd"); // .. becomes __, / becomes _
  });

  it("should remove invalid filename characters", () => {
    const invalidChars = 'test<>:"|?*file';
    const sanitized = pathManager.sanitizePath(invalidChars);

    expect(sanitized).not.toMatch(/[<>:"|?*]/);
    expect(sanitized).toBe("test_______file");
  });

  it("should handle leading dots", () => {
    const dotFile = "...hidden";
    const sanitized = pathManager.sanitizePath(dotFile);

    expect(sanitized).toBe("_hidden");
  });

  it("should sanitize flow IDs", () => {
    const maliciousFlowId = "../../evil.flow";
    const safePath = pathManager.getFlowPath(maliciousFlowId);

    expect(safePath).not.toContain("../../");
    expect(safePath).toContain("____evil.flow.flow.yaml"); // .. becomes __, / becomes _
  });
});
