/**
 * File System Node Metadata
 *
 * Static metadata definition for the File System node
 */

import { NodeMetadata } from "../../base/NodeMetadata.js";

/**
 * File System Metadata Class
 */
class FileSystemNodeMetadata extends NodeMetadata {
  readonly id = "file-system";
  readonly name = "File System";
  readonly type = "file-system";
  readonly version = "1.0.0";
  readonly author = "Atomiton Core Team";
  readonly description =
    "File system operations (read, write, manage directories)";
  readonly category = "io";
  readonly icon = "folder";

  // Keywords for search and discovery
  readonly keywords = [
    "file",
    "filesystem",
    "read",
    "write",
    "directory",
    "folder",
    "io",
    "disk",
  ];
  readonly tags = ["file", "filesystem", "io", "storage"];

  // Optional overrides
  readonly experimental = false;
  readonly deprecated = false;
}

// Export singleton instance
export const fileSystemMetadata = new FileSystemNodeMetadata();

// Export the metadata instance as default for consistency
export default fileSystemMetadata;
