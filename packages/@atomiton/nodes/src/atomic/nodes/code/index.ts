/**
 * Code Node
 *
 * Node for executing custom JavaScript code
 */

import { createAtomicNode } from "../../createAtomicNode";
import { codeParameters } from "./parameters";
import { codeExecutable } from "./executable";
import { codeMetadata } from "./metadata";
import { codePorts } from "./ports";

export const code = createAtomicNode({
  metadata: codeMetadata,
  parameters: codeParameters,
  executable: codeExecutable,
  ports: codePorts,
});

export default code;
