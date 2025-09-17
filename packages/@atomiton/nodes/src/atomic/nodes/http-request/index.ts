/**
 * HTTP Request Node
 *
 * Node for making HTTP/API requests
 */

import { createAtomicNode } from "../../createAtomicNode";
import { httpRequestParameters } from "./parameters";
import { httpRequestExecutable } from "./executable";
import { httpRequestMetadata } from "./metadata";
import { httpRequestPorts } from "./ports";

export const httpRequest = createAtomicNode({
  metadata: httpRequestMetadata,
  parameters: httpRequestParameters,
  executable: httpRequestExecutable,
  ports: httpRequestPorts,
});

export default httpRequest;
