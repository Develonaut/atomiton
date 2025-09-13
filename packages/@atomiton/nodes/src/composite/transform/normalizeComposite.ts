import type {
  CompositeDefinition,
  TransformationOptions,
  TransformationResult,
} from "../types.js";
import { toYaml } from "./toYaml.js";
import { fromYaml } from "./fromYaml.js";

/**
 * Normalize a composite by converting to YAML and back to JSON
 * This ensures consistent formatting and removes any parsing artifacts
 */
export function normalizeComposite(
  composite: CompositeDefinition,
  options: TransformationOptions = {},
): TransformationResult<CompositeDefinition> {
  const yamlResult = toYaml(composite, options);
  if (!yamlResult.success || !yamlResult.data) {
    return {
      success: false,
      errors: yamlResult.errors,
      warnings: yamlResult.warnings,
    };
  }

  return fromYaml(yamlResult.data, options);
}
