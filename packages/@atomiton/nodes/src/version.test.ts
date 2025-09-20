/**
 * Version Validation Smoke Test
 *
 * Tests semantic versioning enforcement and version security features
 */

import { describe, expect, it } from "vitest";
import {
  parseVersion,
  compareVersions,
  isValidVersionUpgrade,
  incrementVersion,
  validateInitialVersion,
  createVersionLock,
  verifyVersionLock,
  getNextVersionOptions,
} from "./validation/version";
import { createNode } from "./createNode";
import {
  updateNodeVersion,
  getVersionUpdateOptions,
} from "./updateNodeVersion";

describe("Version Validation Smoke Test", () => {
  describe("parseVersion", () => {
    it("parses valid semantic versions", () => {
      const cases = [
        { version: "1.0.0", expected: { major: 1, minor: 0, patch: 0 } },
        { version: "2.3.4", expected: { major: 2, minor: 3, patch: 4 } },
        { version: "10.20.30", expected: { major: 10, minor: 20, patch: 30 } },
        { version: "0.0.1", expected: { major: 0, minor: 0, patch: 1 } },
      ];

      cases.forEach(({ version, expected }) => {
        const result = parseVersion(version);
        expect(result.valid).toBe(true);
        expect(result.parsed?.major).toBe(expected.major);
        expect(result.parsed?.minor).toBe(expected.minor);
        expect(result.parsed?.patch).toBe(expected.patch);
      });
    });

    it("parses versions with prerelease and build metadata", () => {
      const result1 = parseVersion("1.0.0-alpha");
      expect(result1.valid).toBe(true);
      expect(result1.parsed?.prerelease).toBe("alpha");

      const result2 = parseVersion("1.0.0-beta.1");
      expect(result2.valid).toBe(true);
      expect(result2.parsed?.prerelease).toBe("beta.1");

      const result3 = parseVersion("1.0.0+build123");
      expect(result3.valid).toBe(true);
      expect(result3.parsed?.build).toBe("build123");

      const result4 = parseVersion("1.0.0-rc.1+build456");
      expect(result4.valid).toBe(true);
      expect(result4.parsed?.prerelease).toBe("rc.1");
      expect(result4.parsed?.build).toBe("build456");
    });

    it("rejects invalid version formats", () => {
      const invalidVersions = [
        "1",
        "1.0",
        "1.0.0.0",
        "v1.0.0",
        "1.0.0-",
        "1.0.0+",
        "a.b.c",
        "1.2.3.4",
        "",
        "latest",
      ];

      invalidVersions.forEach((version) => {
        const result = parseVersion(version);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    it("rejects unreasonable version numbers", () => {
      const result = parseVersion("1000.0.0");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("less than 1000");
    });
  });

  describe("compareVersions", () => {
    it("correctly compares versions", () => {
      expect(compareVersions("2.0.0", "1.0.0")).toBe("greater");
      expect(compareVersions("1.0.0", "2.0.0")).toBe("less");
      expect(compareVersions("1.0.0", "1.0.0")).toBe("equal");

      expect(compareVersions("1.1.0", "1.0.0")).toBe("greater");
      expect(compareVersions("1.0.1", "1.0.0")).toBe("greater");
      expect(compareVersions("1.0.0", "1.0.1")).toBe("less");
    });

    it("handles prerelease versions correctly", () => {
      expect(compareVersions("1.0.0", "1.0.0-alpha")).toBe("greater");
      expect(compareVersions("1.0.0-alpha", "1.0.0")).toBe("less");
      expect(compareVersions("1.0.0-beta", "1.0.0-alpha")).toBe("greater");
      expect(compareVersions("1.0.0-alpha.2", "1.0.0-alpha.1")).toBe("greater");
    });

    it("ignores build metadata in comparisons", () => {
      expect(compareVersions("1.0.0+build1", "1.0.0+build2")).toBe("equal");
      expect(compareVersions("1.0.0+build", "1.0.0")).toBe("equal");
    });
  });

  describe("isValidVersionUpgrade", () => {
    it("allows valid version increments", () => {
      expect(isValidVersionUpgrade("1.0.0", "1.0.1").valid).toBe(true);
      expect(isValidVersionUpgrade("1.0.0", "1.1.0").valid).toBe(true);
      expect(isValidVersionUpgrade("1.0.0", "2.0.0").valid).toBe(true);
      expect(isValidVersionUpgrade("0.0.1", "0.0.2").valid).toBe(true);
    });

    it("prevents version downgrades", () => {
      const result1 = isValidVersionUpgrade("2.0.0", "1.0.0");
      expect(result1.valid).toBe(false);
      expect(result1.reason).toContain("downgrade not allowed");

      const result2 = isValidVersionUpgrade("1.1.0", "1.0.0");
      expect(result2.valid).toBe(false);

      const result3 = isValidVersionUpgrade("1.0.1", "1.0.0");
      expect(result3.valid).toBe(false);
    });

    it("prevents same version", () => {
      const result = isValidVersionUpgrade("1.0.0", "1.0.0");
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("must be incremented");
    });

    it("prevents unreasonable version jumps", () => {
      const result = isValidVersionUpgrade("1.0.0", "12.0.0");
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("jump too large");
    });

    it("enforces proper version reset rules", () => {
      // When major increments, minor and patch must be 0
      const result1 = isValidVersionUpgrade("1.2.3", "2.1.0");
      expect(result1.valid).toBe(false);
      expect(result1.reason).toContain("minor and patch must be 0");

      // When minor increments, patch must be 0
      const result2 = isValidVersionUpgrade("1.2.3", "1.3.1");
      expect(result2.valid).toBe(false);
      expect(result2.reason).toContain("patch must be 0");

      // Valid resets
      expect(isValidVersionUpgrade("1.2.3", "2.0.0").valid).toBe(true);
      expect(isValidVersionUpgrade("1.2.3", "1.3.0").valid).toBe(true);
    });
  });

  describe("incrementVersion", () => {
    it("increments patch version", () => {
      expect(incrementVersion("1.0.0", "patch")).toBe("1.0.1");
      expect(incrementVersion("1.2.3", "patch")).toBe("1.2.4");
      expect(incrementVersion("0.0.0", "patch")).toBe("0.0.1");
    });

    it("increments minor version and resets patch", () => {
      expect(incrementVersion("1.0.0", "minor")).toBe("1.1.0");
      expect(incrementVersion("1.2.3", "minor")).toBe("1.3.0");
      expect(incrementVersion("0.0.1", "minor")).toBe("0.1.0");
    });

    it("increments major version and resets minor/patch", () => {
      expect(incrementVersion("1.0.0", "major")).toBe("2.0.0");
      expect(incrementVersion("1.2.3", "major")).toBe("2.0.0");
      expect(incrementVersion("0.1.0", "major")).toBe("1.0.0");
    });

    it("throws on invalid version", () => {
      expect(() => incrementVersion("invalid", "patch")).toThrow();
      expect(() => incrementVersion("1.0", "patch")).toThrow();
    });
  });

  describe("validateInitialVersion", () => {
    it("accepts standard initial versions", () => {
      expect(validateInitialVersion("1.0.0").valid).toBe(true);
      expect(validateInitialVersion("0.1.0").valid).toBe(true);
      expect(validateInitialVersion("0.0.1").valid).toBe(true);
    });

    it("accepts prerelease initial versions", () => {
      expect(validateInitialVersion("1.0.0-alpha").valid).toBe(true);
      expect(validateInitialVersion("0.1.0-beta").valid).toBe(true);
      expect(validateInitialVersion("0.0.1-rc.1").valid).toBe(true);
    });

    it("rejects non-standard initial versions", () => {
      const result1 = validateInitialVersion("2.0.0");
      expect(result1.valid).toBe(false);
      expect(result1.reason).toContain("Initial version should be");

      expect(validateInitialVersion("1.1.0").valid).toBe(false);
      expect(validateInitialVersion("0.2.0").valid).toBe(false);
      expect(validateInitialVersion("0.0.2").valid).toBe(false);
    });
  });

  describe("version locking", () => {
    it("creates consistent version locks", () => {
      const lock1 = createVersionLock("node1", "1.0.0", "2024-01-01T00:00:00Z");
      const lock2 = createVersionLock("node1", "1.0.0", "2024-01-01T00:00:00Z");
      expect(lock1).toBe(lock2);
      expect(lock1).toHaveLength(8);
    });

    it("creates different locks for different inputs", () => {
      const lock1 = createVersionLock("node1", "1.0.0", "2024-01-01T00:00:00Z");
      const lock2 = createVersionLock("node2", "1.0.0", "2024-01-01T00:00:00Z");
      const lock3 = createVersionLock("node1", "2.0.0", "2024-01-01T00:00:00Z");
      const lock4 = createVersionLock("node1", "1.0.0", "2024-01-02T00:00:00Z");

      expect(lock1).not.toBe(lock2);
      expect(lock1).not.toBe(lock3);
      expect(lock1).not.toBe(lock4);
    });

    it("verifies valid version locks", () => {
      const nodeId = "test-node";
      const version = "1.0.0";
      const timestamp = "2024-01-01T00:00:00Z";
      const lock = createVersionLock(nodeId, version, timestamp);

      expect(verifyVersionLock(nodeId, version, timestamp, lock)).toBe(true);
    });

    it("detects tampered version locks", () => {
      const nodeId = "test-node";
      const version = "1.0.0";
      const timestamp = "2024-01-01T00:00:00Z";
      const lock = createVersionLock(nodeId, version, timestamp);

      // Tampered version
      expect(verifyVersionLock(nodeId, "2.0.0", timestamp, lock)).toBe(false);

      // Tampered node ID
      expect(verifyVersionLock("other-node", version, timestamp, lock)).toBe(
        false,
      );

      // Tampered timestamp
      expect(
        verifyVersionLock(nodeId, version, "2024-01-02T00:00:00Z", lock),
      ).toBe(false);

      // Tampered lock
      expect(verifyVersionLock(nodeId, version, timestamp, "fakehash")).toBe(
        false,
      );
    });
  });

  describe("getNextVersionOptions", () => {
    it("provides next version options", () => {
      const options = getNextVersionOptions("1.2.3");
      expect(options).toEqual({
        patch: "1.2.4",
        minor: "1.3.0",
        major: "2.0.0",
      });
    });

    it("handles edge cases", () => {
      const options1 = getNextVersionOptions("0.0.0");
      expect(options1).toEqual({
        patch: "0.0.1",
        minor: "0.1.0",
        major: "1.0.0",
      });

      const options2 = getNextVersionOptions("999.999.999");
      expect(options2).toEqual({
        patch: "999.999.1000",
        minor: "999.1000.0",
        major: "1000.0.0",
      });
    });

    it("returns null for invalid versions", () => {
      expect(getNextVersionOptions("invalid")).toBeNull();
      expect(getNextVersionOptions("1.0")).toBeNull();
      expect(getNextVersionOptions("")).toBeNull();
    });
  });

  describe("createNode with version validation", () => {
    it("creates node with default version", () => {
      const node = createNode({
        name: "Test Node",
        type: "atomic",
      });

      expect(node.version).toBe("1.0.0");
      expect(node.metadata?.versionLock).toBeDefined();
    });

    it("creates node with valid custom version for new nodes", () => {
      const node = createNode({
        name: "Test Node",
        type: "atomic",
        version: "0.1.0",
      });

      expect(node.version).toBe("0.1.0");
    });

    it("throws on invalid version format", () => {
      expect(() =>
        createNode({
          name: "Test Node",
          version: "1.0",
        }),
      ).toThrow("Invalid version format");
    });

    it("throws on invalid initial version for new nodes", () => {
      expect(() =>
        createNode({
          name: "Test Node",
          version: "2.0.0",
        }),
      ).toThrow("Invalid initial version");
    });

    it("allows any valid version when ID is provided (existing node)", () => {
      const node = createNode({
        id: "existing-node",
        name: "Existing Node",
        version: "5.3.2",
      });

      expect(node.version).toBe("5.3.2");
      expect(node.metadata?.versionLock).toBeDefined();
    });
  });

  describe("updateNodeVersion", () => {
    it("auto-increments patch version by default", () => {
      const node = createNode({
        name: "Test Node",
        version: "1.0.0",
      });

      const result = updateNodeVersion({ node });
      expect(result.success).toBe(true);
      expect(result.newVersion).toBe("1.0.1");
      expect(result.node?.version).toBe("1.0.1");
      expect(result.node?.metadata?.previousVersion).toBe("1.0.0");
    });

    it("increments version by type", () => {
      const node = createNode({
        id: "existing-node",
        name: "Test Node",
        version: "1.2.3",
      });

      const patchResult = updateNodeVersion({ node, incrementType: "patch" });
      expect(patchResult.newVersion).toBe("1.2.4");

      const minorResult = updateNodeVersion({ node, incrementType: "minor" });
      expect(minorResult.newVersion).toBe("1.3.0");

      const majorResult = updateNodeVersion({ node, incrementType: "major" });
      expect(majorResult.newVersion).toBe("2.0.0");
    });

    it("updates to explicit version", () => {
      const node = createNode({
        name: "Test Node",
        version: "1.0.0",
      });

      const result = updateNodeVersion({ node, newVersion: "1.1.0" });
      expect(result.success).toBe(true);
      expect(result.newVersion).toBe("1.1.0");
    });

    it("prevents version downgrade", () => {
      const node = createNode({
        id: "existing-node",
        name: "Test Node",
        version: "2.0.0",
      });

      const result = updateNodeVersion({ node, newVersion: "1.0.0" });
      expect(result.success).toBe(false);
      expect(result.error).toContain("downgrade not allowed");
    });

    it("verifies version lock integrity", () => {
      const node = createNode({
        name: "Test Node",
        version: "1.0.0",
      });

      // Tamper with version lock
      node.metadata!.versionLock = "tamperedhash";

      const result = updateNodeVersion({ node });
      expect(result.success).toBe(false);
      expect(result.error).toContain("Version lock verification failed");
    });

    it("updates metadata correctly", () => {
      const node = createNode({
        name: "Test Node",
        version: "1.0.0",
      });

      const result = updateNodeVersion({
        node,
        incrementType: "minor",
        author: "TestUser",
      });

      expect(result.success).toBe(true);
      expect(result.node?.metadata?.lastModifiedBy).toBe("TestUser");
      expect(result.node?.metadata?.modified).toBeDefined();
      expect(result.node?.metadata?.versionLock).toBeDefined();
    });
  });

  describe("getVersionUpdateOptions", () => {
    it("provides update options for valid node", () => {
      const node = createNode({
        id: "existing-node",
        name: "Test Node",
        version: "1.2.3",
      });

      const options = getVersionUpdateOptions(node);
      expect(options.canUpdate).toBe(true);
      expect(options.currentVersion).toBe("1.2.3");
      expect(options.options).toEqual({
        patch: "1.2.4",
        minor: "1.3.0",
        major: "2.0.0",
      });
    });

    it("detects tampered nodes", () => {
      const node = createNode({
        name: "Test Node",
        version: "1.0.0",
      });

      // Tamper with version lock
      node.metadata!.versionLock = "invalid";

      const options = getVersionUpdateOptions(node);
      expect(options.canUpdate).toBe(false);
      expect(options.reason).toContain("Version lock verification failed");
    });
  });
});
