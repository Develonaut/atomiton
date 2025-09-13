/**
 * Parallel Node Metadata
 *
 * Static metadata definition for the Parallel node
 */

import { NodeMetadata } from "../../base/NodeMetadata.js";

/**
 * Parallel Metadata Class
 */
class ParallelNodeMetadata extends NodeMetadata {
  readonly id = "parallel";
  readonly name = "Parallel";
  readonly type = "parallel";
  readonly version = "1.0.0";
  readonly author = "Atomiton Core Team";
  readonly description = "Run multiple operations simultaneously";
  readonly category = "logic";
  readonly icon = "zap";

  // Keywords for search and discovery
  readonly keywords = [
    "parallel",
    "concurrent",
    "async",
    "batch",
    "simultaneous",
    "control",
    "flow",
  ];
  readonly tags = ["parallel", "concurrent", "async", "batch", "simultaneous"];

  // Optional overrides
  readonly experimental = false;
  readonly deprecated = false;
}

// Export singleton instance
export const parallelMetadata = new ParallelNodeMetadata();

// Export the metadata instance as default for consistency
export default parallelMetadata;
