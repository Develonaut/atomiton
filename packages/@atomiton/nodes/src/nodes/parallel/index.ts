/**
 * Parallel Node
 *
 * Node for running multiple operations simultaneously
 */

import { createNode } from "../../base/createNode";
import { parallelParameters } from "./parameters";
import { parallelLogic } from "./logic";
import { parallelMetadata } from "./metadata";
import { parallelPorts } from "./ports";

export const parallel = createNode({
  metadata: parallelMetadata,
  parameters: parallelParameters,
  logic: parallelLogic,
  ports: parallelPorts,
});

export default parallel;
