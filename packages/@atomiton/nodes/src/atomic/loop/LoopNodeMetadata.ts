/**
 * Loop Node Metadata
 *
 * Static metadata definition for the Loop node
 */

import { NodeMetadata } from "../../base/NodeMetadata";

/**
 * Loop Metadata Class
 */
class LoopNodeMetadata extends NodeMetadata {
  readonly id = "loop";
  readonly name = "Loop";
  readonly type = "loop";
  readonly version = "1.0.0";
  readonly author = "Atomiton Core Team";
  readonly description = "Loop over items and execute operations";
  readonly category = "logic";
  readonly icon = "repeat";

  // Keywords for search and discovery
  readonly keywords = [
    "loop",
    "iterate",
    "foreach",
    "batch",
    "repeat",
    "control",
    "flow",
  ];
  readonly tags = ["loop", "iterate", "foreach", "batch", "repeat"];

  // Optional overrides
  readonly experimental = false;
  readonly deprecated = false;
}

// Export singleton instance
export const loopMetadata = new LoopNodeMetadata();

// Export the metadata instance as default for consistency
export default loopMetadata;
