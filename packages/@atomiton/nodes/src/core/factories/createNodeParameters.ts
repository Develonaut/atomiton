/**
 * Factory function for creating node parameters
 */

import type { NodeParameters } from "#core/types/definition.js";

/**
 * Creates a flat NodeParameters object with base defaults
 * Note: Schema registration happens separately in the schemas module
 */
function createNodeParameters(
  parameters?: Record<string, unknown>,
): NodeParameters {
  const parameterValues = parameters || {};

  // Base defaults that all nodes share
  const baseDefaults = {
    enabled: true,
    timeout: 30000,
    retries: 1,
  };

  return {
    ...baseDefaults,
    ...parameterValues,
  };
}

export { createNodeParameters };
export default createNodeParameters;
