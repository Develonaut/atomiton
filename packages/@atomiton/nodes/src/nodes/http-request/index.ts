/**
 * HTTP Request Node
 *
 * Node for making HTTP/API requests
 */

import { createNode } from "../../base/createNode";
import { httpRequestParameters } from "./parameters";
import { httpRequestLogic } from "./logic";
import { httpRequestMetadata } from "./metadata";
import { httpRequestPorts } from "./ports";

export const httpRequest = createNode({
  metadata: httpRequestMetadata,
  parameters: httpRequestParameters,
  logic: httpRequestLogic,
  ports: httpRequestPorts,
});

export default httpRequest;
