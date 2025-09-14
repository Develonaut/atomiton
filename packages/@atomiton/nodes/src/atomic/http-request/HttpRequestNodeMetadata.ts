/**
 * HTTP Request Node Metadata
 *
 * Static metadata definition for the HTTP Request node
 */

import { NodeMetadata } from "../../base/NodeMetadata";

/**
 * HTTP Request Metadata Class
 */
class HttpRequestNodeMetadata extends NodeMetadata {
  readonly id = "http-request";
  readonly name = "HTTP Request";
  readonly type = "http-request";
  readonly version = "1.0.0";
  readonly author = "Atomiton Core Team";
  readonly description = "Make HTTP requests (GET, POST, PUT, DELETE)";
  readonly category = "io";
  readonly icon = "globe";

  // Keywords for search and discovery
  readonly keywords = [
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
  ];
  readonly tags = ["http", "api", "network", "rest"];

  // Optional overrides
  readonly experimental = false;
  readonly deprecated = false;
}

// Export singleton instance
export const httpRequestMetadata = new HttpRequestNodeMetadata();

// Export the metadata instance as default for consistency
export default httpRequestMetadata;
