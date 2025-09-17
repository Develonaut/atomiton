/**
 * Update Node Version
 *
 * Safely updates a node's version with proper validation to prevent downgrades
 * and ensure version integrity.
 */

import type { Node } from "./types";
import {
  isValidVersionUpgrade,
  incrementVersion,
  createVersionLock,
  verifyVersionLock,
} from "./validation/version";

export type VersionUpdateType = "major" | "minor" | "patch";

export type UpdateNodeVersionInput = {
  node: Node;
  newVersion?: string;
  incrementType?: VersionUpdateType;
  author?: string;
};

export type UpdateNodeVersionResult = {
  success: boolean;
  node?: Node;
  error?: string;
  previousVersion?: string;
  newVersion?: string;
};

/**
 * Update a node's version safely
 *
 * @param input - Update configuration
 * @returns Result with updated node or error
 */
export function updateNodeVersion(
  input: UpdateNodeVersionInput,
): UpdateNodeVersionResult {
  const { node, newVersion, incrementType, author } = input;

  // Ensure node has a version
  if (!node.version) {
    return {
      success: false,
      error: "Node does not have a version",
    };
  }

  // Verify existing version lock if present
  if (node.metadata?.versionLock) {
    const isValid = verifyVersionLock(
      node.id,
      node.version,
      node.metadata.created || "",
      node.metadata.versionLock as string,
    );

    if (!isValid) {
      return {
        success: false,
        error:
          "Version lock verification failed. Node may have been tampered with.",
        previousVersion: node.version,
      };
    }
  }

  // Determine the new version
  let targetVersion: string;

  if (newVersion) {
    // Explicit version provided
    targetVersion = newVersion;
  } else if (incrementType) {
    // Auto-increment version
    try {
      targetVersion = incrementVersion(node.version, incrementType);
    } catch (error) {
      return {
        success: false,
        error: `Failed to increment version: ${error instanceof Error ? error.message : String(error)}`,
        previousVersion: node.version,
      };
    }
  } else {
    // Default to patch increment
    try {
      targetVersion = incrementVersion(node.version, "patch");
    } catch (error) {
      return {
        success: false,
        error: `Failed to auto-increment version: ${error instanceof Error ? error.message : String(error)}`,
        previousVersion: node.version,
      };
    }
  }

  // Validate the version upgrade
  const validation = isValidVersionUpgrade(node.version, targetVersion);

  if (!validation.valid) {
    return {
      success: false,
      error: validation.reason,
      previousVersion: node.version,
      newVersion: targetVersion,
    };
  }

  // Create updated node with new version
  const now = new Date().toISOString();
  const versionLock = createVersionLock(
    node.id,
    targetVersion,
    node.metadata?.created || now,
  );

  const updatedNode: Node = {
    ...node,
    version: targetVersion,
    metadata: {
      ...node.metadata,
      modified: now,
      previousVersion: node.version,
      versionLock,
      lastModifiedBy: author || node.metadata?.author || "User",
    },
  };

  return {
    success: true,
    node: updatedNode,
    previousVersion: node.version,
    newVersion: targetVersion,
  };
}

/**
 * Check if a node can be updated to a specific version
 *
 * @param node - The node to check
 * @param targetVersion - The target version
 * @returns Whether the update is allowed
 */
export function canUpdateToVersion(
  node: Node,
  targetVersion: string,
): { canUpdate: boolean; reason?: string } {
  if (!node.version) {
    return {
      canUpdate: false,
      reason: "Node does not have a version",
    };
  }

  const validation = isValidVersionUpgrade(node.version, targetVersion);

  return {
    canUpdate: validation.valid,
    reason: validation.reason,
  };
}

/**
 * Get available version update options for a node
 *
 * @param node - The node to check
 * @returns Available version options
 */
export function getVersionUpdateOptions(node: Node): {
  currentVersion: string;
  canUpdate: boolean;
  options?: {
    patch: string;
    minor: string;
    major: string;
  };
  reason?: string;
} {
  // Check if node has a version
  if (!node.version) {
    return {
      currentVersion: "unknown",
      canUpdate: false,
      reason: "Node does not have a version",
    };
  }

  // Verify version lock if present
  if (node.metadata?.versionLock) {
    const isValid = verifyVersionLock(
      node.id,
      node.version,
      node.metadata.created || "",
      node.metadata.versionLock as string,
    );

    if (!isValid) {
      return {
        currentVersion: node.version,
        canUpdate: false,
        reason: "Version lock verification failed",
      };
    }
  }

  try {
    const patchVersion = incrementVersion(node.version, "patch");
    const minorVersion = incrementVersion(node.version, "minor");
    const majorVersion = incrementVersion(node.version, "major");

    return {
      currentVersion: node.version,
      canUpdate: true,
      options: {
        patch: patchVersion,
        minor: minorVersion,
        major: majorVersion,
      },
    };
  } catch (error) {
    return {
      currentVersion: node.version,
      canUpdate: false,
      reason: `Invalid current version: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
