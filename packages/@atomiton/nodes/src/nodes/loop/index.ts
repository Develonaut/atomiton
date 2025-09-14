/**
 * Loop Node
 *
 * Node for looping and iterating over data items
 */

import { createNode } from "../../base/createNode";
import { loopParameters } from "./parameters";
import { loopLogic } from "./logic";
import { loopMetadata } from "./metadata";
import { loopPorts } from "./ports";

export const loop = createNode({
  metadata: loopMetadata,
  parameters: loopParameters,
  logic: loopLogic,
  ports: loopPorts,
});

export default loop;
