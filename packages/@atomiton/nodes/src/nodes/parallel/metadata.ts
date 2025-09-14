/**
 * Parallel Node Metadata
 *
 * Static metadata definition for the Parallel node
 */

import { createNodeMetadata } from "../../base/createNodeMetadata";

export const parallelMetadata = createNodeMetadata({
  id: "parallel",
  name: "Parallel",
  description: "Run multiple operations simultaneously",
  category: "logic",
  icon: "zap",
  keywords: [
    "parallel",
    "concurrent",
    "async",
    "batch",
    "simultaneous",
    "performance",
  ],
  tags: ["parallel", "concurrent", "control", "async"],
});
