/**
 * Loop Node
 *
 * Node for looping and iterating over data items
 */

import { createAtomicNode } from "../../createAtomicNode";
import { loopParameters } from "./parameters";
import { loopExecutable } from "./executable";
import { loopMetadata } from "./metadata";
import { loopPorts } from "./ports";

export const loop = createAtomicNode({
  metadata: loopMetadata,
  parameters: loopParameters,
  executable: loopExecutable,
  ports: loopPorts,
});

export default loop;
