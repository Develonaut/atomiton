/**
 * File System Node Metadata
 *
 * Static metadata definition for the File System node
 */

import { createNodeMetadata } from "../../base/createNodeMetadata";

export const fileSystemMetadata = createNodeMetadata({
  id: "file-system",
  name: "File System",
  description: "File system operations (read, write, manage directories)",
  category: "io",
  icon: "file",
  keywords: [
    "file",
    "filesystem",
    "read",
    "write",
    "directory",
    "folder",
    "io",
    "disk",
  ],
  tags: ["file", "filesystem", "io", "storage"],
});
