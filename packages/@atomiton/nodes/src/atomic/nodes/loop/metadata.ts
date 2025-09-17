/**
 * Loop Node Metadata
 *
 * Static metadata definition for the Loop node
 */

import { createAtomicMetadata } from "../../createAtomicMetadata";

export const loopMetadata = createAtomicMetadata({
  id: "loop",
  name: "Loop",
  description: "Loop and iterate over data items",
  category: "logic",
  icon: "git-branch",
  keywords: [
    "loop",
    "iterate",
    "foreach",
    "while",
    "repeat",
    "batch",
    "process",
  ],
  tags: ["loop", "iterate", "control", "repeat"],
});
