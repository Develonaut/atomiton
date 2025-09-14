import type {
  CompositeDefinition,
  TransformationOptions,
  TransformationResult,
} from "../types";
import { toYaml } from "./toYaml";
import { fromYaml } from "./fromYaml";

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
