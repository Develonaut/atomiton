/**
 * Schema Registration
 * Registers all node schemas in the central registry
 */

import { registerNodeSchema } from "#schemas/registry";

// Import all node schema shapes
import httpRequestSchemaShape from "#schemas/http-request";
import codeSchemaShape from "#schemas/code";
import csvReaderSchemaShape from "#schemas/csv-reader";
import fileSystemSchemaShape from "#schemas/file-system";
import groupSchemaShape from "#schemas/group";
import imageCompositeSchemaShape from "#schemas/image-composite";
import loopSchemaShape from "#schemas/loop";
import parallelSchemaShape from "#schemas/parallel";
import shellCommandSchemaShape from "#schemas/shell-command";
import transformSchemaShape from "#schemas/transform";

/**
 * Register all node schemas
 * This is called once at application startup
 */
export function registerAllNodeSchemas(): void {
  // Register each node type's schema
  registerNodeSchema("http-request", httpRequestSchemaShape);
  registerNodeSchema("code", codeSchemaShape);
  registerNodeSchema("csv-reader", csvReaderSchemaShape);
  registerNodeSchema("file-system", fileSystemSchemaShape);
  registerNodeSchema("group", groupSchemaShape);
  registerNodeSchema("image-composite", imageCompositeSchemaShape);
  registerNodeSchema("loop", loopSchemaShape);
  registerNodeSchema("parallel", parallelSchemaShape);
  registerNodeSchema("shell-command", shellCommandSchemaShape);
  registerNodeSchema("transform", transformSchemaShape);
}

// Auto-register on module import for Node.js environments
if (typeof process !== "undefined" && process.versions?.node) {
  registerAllNodeSchemas();
}
