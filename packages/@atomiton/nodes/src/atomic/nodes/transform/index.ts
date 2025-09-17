/**
 * Transform Node
 *
 * Node for transforming and manipulating data arrays
 */

import { createAtomicNode } from "../../createAtomicNode";
import { transformParameters } from "./parameters";
import { transformExecutable } from "./executable";
import { transformMetadata } from "./metadata";
import { transformPorts } from "./ports";

export const transform = createAtomicNode({
  metadata: transformMetadata,
  parameters: transformParameters,
  executable: transformExecutable,
  ports: transformPorts,
});

export default transform;
