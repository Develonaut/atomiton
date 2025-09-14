/**
 * Transform Node
 *
 * Node for transforming and manipulating data arrays
 */

import { createNode } from "../../base/createNode";
import { transformParameters } from "./parameters";
import { transformLogic } from "./logic";
import { transformMetadata } from "./metadata";
import { transformPorts } from "./ports";

export const transform = createNode({
  metadata: transformMetadata,
  parameters: transformParameters,
  logic: transformLogic,
  ports: transformPorts,
});

export default transform;
