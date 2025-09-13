import type { CompositeValidationContext } from "../types";
import { fromYaml } from "./fromYaml";

/**
 * Check if a string is valid YAML that can be converted to a composite
 */
export function isValidCompositeYaml(
  yamlString: string,
  validationContext?: CompositeValidationContext,
): boolean {
  try {
    const result = fromYaml(
      yamlString,
      { validateResult: true },
      validationContext,
    );
    return result.success;
  } catch {
    return false;
  }
}
