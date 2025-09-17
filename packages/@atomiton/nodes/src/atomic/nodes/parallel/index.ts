/**
 * Parallel Node
 *
 * Node for running multiple operations simultaneously
 */

import { createAtomicNode } from "../../createAtomicNode";
import { parallelParameters } from "./parameters";
import { parallelExecutable } from "./executable";
import { parallelMetadata } from "./metadata";
import { parallelPorts } from "./ports";

export const parallel = createAtomicNode({
  metadata: parallelMetadata,
  parameters: parallelParameters,
  executable: parallelExecutable,
  ports: parallelPorts,
});

export default parallel;
