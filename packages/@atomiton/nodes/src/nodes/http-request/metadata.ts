/**
 * HTTP Request Node Metadata
 *
 * Static metadata definition for the HTTP Request node
 */

import { createNodeMetadata } from "../../base/createNodeMetadata";

export const httpRequestMetadata = createNodeMetadata({
  id: "http-request",
  name: "HTTP Request",
  description: "Make HTTP requests (GET, POST, PUT, DELETE)",
  category: "io",
  icon: "globe-2",
  keywords: [
    "http",
    "request",
    "api",
    "rest",
    "get",
    "post",
    "put",
    "delete",
    "fetch",
    "ajax",
  ],
  tags: ["http", "api", "network", "rest"],
});
