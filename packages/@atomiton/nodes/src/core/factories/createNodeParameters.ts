/**
 * Factory function for creating node parameters
 */

import type {
  NodeFieldsConfig,
  NodeParameters,
} from "#core/types/definition.js";
import { isNodeParameters } from "#core/utils/nodeUtils.js";

/**
 * Creates a serializable NodeParameters object
 * Note: Schema registration happens separately in the schemas module
 */
function createNodeParameters(
  parametersOrDefaults: NodeParameters | Record<string, unknown>,
  fields?: NodeFieldsConfig,
): NodeParameters {
  if (isNodeParameters(parametersOrDefaults)) {
    return parametersOrDefaults as NodeParameters;
  }

  const defaults = parametersOrDefaults || {};
  const fieldConfig = fields || {};

  // Base defaults that all nodes share
  const baseDefaults = {
    enabled: true,
    timeout: 30000,
    retries: 1,
  };

  const fullDefaults = {
    ...baseDefaults,
    ...defaults,
  } as Record<string, unknown>;

  return {
    defaults: fullDefaults,
    fields: fieldConfig,
  };
}

export { createNodeParameters };
export default createNodeParameters;
