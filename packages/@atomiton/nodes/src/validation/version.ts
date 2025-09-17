/**
 * Version Validation and Management
 *
 * Enforces semantic versioning rules similar to NPM:
 * - Versions must follow semver format (major.minor.patch)
 * - Versions can only be incremented, never downgraded
 * - Protects against version manipulation by bad actors
 */

/**
 * Semantic version components
 */
export type SemanticVersion = {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  build?: string;
};

/**
 * Version comparison result
 */
export type VersionComparison = "greater" | "equal" | "less" | "invalid";

/**
 * Version validation result
 */
export type VersionValidationResult = {
  valid: boolean;
  error?: string;
  parsed?: SemanticVersion;
};

/**
 * Parse a semantic version string into components
 * Follows NPM's semver specification
 */
export function parseVersion(version: string): VersionValidationResult {
  if (!version || typeof version !== "string") {
    return {
      valid: false,
      error: "Version must be a non-empty string",
    };
  }

  // Regex for semantic versioning (simplified, covers most cases)
  // Format: major.minor.patch[-prerelease][+build]
  const semverRegex =
    /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/;
  const match = version.match(semverRegex);

  if (!match) {
    return {
      valid: false,
      error: `Invalid version format: "${version}". Must follow semantic versioning (e.g., 1.0.0)`,
    };
  }

  const [, major, minor, patch, prerelease, build] = match;

  const parsed: SemanticVersion = {
    major: parseInt(major, 10),
    minor: parseInt(minor, 10),
    patch: parseInt(patch, 10),
  };

  if (prerelease) {
    parsed.prerelease = prerelease;
  }

  if (build) {
    parsed.build = build;
  }

  // Validate version components are reasonable
  if (parsed.major > 999 || parsed.minor > 999 || parsed.patch > 999) {
    return {
      valid: false,
      error: "Version components must be less than 1000",
    };
  }

  return {
    valid: true,
    parsed,
  };
}

/**
 * Compare two semantic versions
 * Returns "greater" if v1 > v2, "less" if v1 < v2, "equal" if v1 === v2
 */
export function compareVersions(v1: string, v2: string): VersionComparison {
  const result1 = parseVersion(v1);
  const result2 = parseVersion(v2);

  if (!result1.valid || !result2.valid) {
    return "invalid";
  }

  const ver1 = result1.parsed!;
  const ver2 = result2.parsed!;

  // Compare major version
  if (ver1.major > ver2.major) return "greater";
  if (ver1.major < ver2.major) return "less";

  // Compare minor version
  if (ver1.minor > ver2.minor) return "greater";
  if (ver1.minor < ver2.minor) return "less";

  // Compare patch version
  if (ver1.patch > ver2.patch) return "greater";
  if (ver1.patch < ver2.patch) return "less";

  // Compare prerelease versions (if both have them)
  if (ver1.prerelease && ver2.prerelease) {
    // Prerelease versions have lower precedence than normal versions
    // 1.0.0-alpha < 1.0.0
    if (ver1.prerelease > ver2.prerelease) return "greater";
    if (ver1.prerelease < ver2.prerelease) return "less";
  } else if (ver1.prerelease && !ver2.prerelease) {
    // 1.0.0-alpha < 1.0.0
    return "less";
  } else if (!ver1.prerelease && ver2.prerelease) {
    // 1.0.0 > 1.0.0-alpha
    return "greater";
  }

  // Build metadata doesn't affect version precedence
  return "equal";
}

/**
 * Check if a version upgrade is valid
 * Ensures versions can only be incremented, not downgraded
 */
export function isValidVersionUpgrade(
  currentVersion: string,
  newVersion: string,
): { valid: boolean; reason?: string } {
  // Parse both versions
  const currentResult = parseVersion(currentVersion);
  const newResult = parseVersion(newVersion);

  if (!currentResult.valid) {
    return {
      valid: false,
      reason: `Current version is invalid: ${currentResult.error}`,
    };
  }

  if (!newResult.valid) {
    return {
      valid: false,
      reason: `New version is invalid: ${newResult.error}`,
    };
  }

  // Compare versions
  const comparison = compareVersions(newVersion, currentVersion);

  if (comparison === "invalid") {
    return {
      valid: false,
      reason: "Version comparison failed",
    };
  }

  if (comparison === "less") {
    return {
      valid: false,
      reason: `Version downgrade not allowed: ${newVersion} is less than ${currentVersion}`,
    };
  }

  if (comparison === "equal") {
    return {
      valid: false,
      reason: `Version must be incremented: ${newVersion} equals ${currentVersion}`,
    };
  }

  // Validate increment is reasonable (not jumping too many versions)
  const current = currentResult.parsed!;
  const next = newResult.parsed!;

  // Major version jump check (max 10 major versions at once)
  if (next.major - current.major > 10) {
    return {
      valid: false,
      reason: `Major version jump too large: ${current.major}.x.x to ${next.major}.x.x`,
    };
  }

  // If major version increased, minor and patch should reset to 0
  if (next.major > current.major) {
    if (next.minor !== 0 || next.patch !== 0) {
      return {
        valid: false,
        reason: `When incrementing major version, minor and patch must be 0. Got ${next.major}.${next.minor}.${next.patch}`,
      };
    }
  }

  // If minor version increased, patch should reset to 0
  if (next.major === current.major && next.minor > current.minor) {
    if (next.patch !== 0) {
      return {
        valid: false,
        reason: `When incrementing minor version, patch must be 0. Got ${next.major}.${next.minor}.${next.patch}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Increment a version automatically
 * Follows NPM's version increment patterns
 */
export function incrementVersion(
  version: string,
  type: "major" | "minor" | "patch" = "patch",
): string {
  const result = parseVersion(version);
  if (!result.valid || !result.parsed) {
    throw new Error(`Invalid version: ${version}`);
  }

  const ver = result.parsed;

  switch (type) {
    case "major":
      return `${ver.major + 1}.0.0`;
    case "minor":
      return `${ver.major}.${ver.minor + 1}.0`;
    case "patch":
      return `${ver.major}.${ver.minor}.${ver.patch + 1}`;
    default:
      throw new Error(`Invalid increment type: ${type}`);
  }
}

/**
 * Get the next valid version options
 * Returns the possible next versions (patch, minor, major)
 */
export function getNextVersionOptions(currentVersion: string): {
  patch: string;
  minor: string;
  major: string;
} | null {
  const result = parseVersion(currentVersion);
  if (!result.valid || !result.parsed) {
    return null;
  }

  return {
    patch: incrementVersion(currentVersion, "patch"),
    minor: incrementVersion(currentVersion, "minor"),
    major: incrementVersion(currentVersion, "major"),
  };
}

/**
 * Validate version for a new node
 * For new nodes, version should typically be 1.0.0 or 0.1.0
 */
export function validateInitialVersion(version: string): {
  valid: boolean;
  reason?: string;
} {
  const result = parseVersion(version);
  if (!result.valid) {
    return {
      valid: false,
      reason: result.error,
    };
  }

  const ver = result.parsed!;

  // Allow common initial versions
  const validInitialVersions = [
    { major: 1, minor: 0, patch: 0 }, // Production ready
    { major: 0, minor: 1, patch: 0 }, // Initial development
    { major: 0, minor: 0, patch: 1 }, // Very early/experimental
  ];

  const isValidInitial = validInitialVersions.some(
    (v) =>
      v.major === ver.major && v.minor === ver.minor && v.patch === ver.patch,
  );

  if (!isValidInitial && !ver.prerelease) {
    return {
      valid: false,
      reason: `Initial version should be 1.0.0, 0.1.0, or 0.0.1. Got ${version}`,
    };
  }

  return { valid: true };
}

/**
 * Create a version lock to prevent tampering
 * Returns a hash that can be used to verify version integrity
 */
export function createVersionLock(
  nodeId: string,
  version: string,
  timestamp: string,
): string {
  // Simple lock mechanism - in production, use proper cryptographic hashing
  const data = `${nodeId}:${version}:${timestamp}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

/**
 * Verify a version hasn't been tampered with
 */
export function verifyVersionLock(
  nodeId: string,
  version: string,
  timestamp: string,
  lock: string,
): boolean {
  const expectedLock = createVersionLock(nodeId, version, timestamp);
  return expectedLock === lock;
}
