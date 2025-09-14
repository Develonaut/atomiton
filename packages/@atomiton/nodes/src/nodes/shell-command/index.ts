/**
 * Shell Command Node
 *
 * Node for executing shell commands and capturing output
 */

import { createNode } from "../../base/createNode";
import { shellCommandParameters } from "./parameters";
import { shellCommandLogic } from "./logic";
import { shellCommandMetadata } from "./metadata";
import { shellCommandPorts } from "./ports";

export const shellCommand = createNode({
  metadata: shellCommandMetadata,
  parameters: shellCommandParameters,
  logic: shellCommandLogic,
  ports: shellCommandPorts,
});

export default shellCommand;
