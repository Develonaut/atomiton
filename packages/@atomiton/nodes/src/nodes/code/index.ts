/**
 * Code Node
 *
 * Node for executing custom JavaScript code
 */

import { createNode } from "../../base/createNode";
import { codeParameters } from "./parameters";
import { codeLogic } from "./logic";
import { codeMetadata } from "./metadata";
import { codePorts } from "./ports";

export const code = createNode({
  metadata: codeMetadata,
  parameters: codeParameters,
  logic: codeLogic,
  ports: codePorts,
});

export default code;
