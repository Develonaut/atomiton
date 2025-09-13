import type { ValidationResult } from "../types";
import { fromYaml } from "./fromYaml";
import { validate } from "./validate";

export function validateYaml(yamlString: string): ValidationResult {
  try {
    const composite = fromYaml(yamlString);
    return validate(composite);
  } catch (error) {
    return {
      success: false,
      data: undefined,
      errors: [
        {
          path: "yaml",
          message: error instanceof Error ? error.message : String(error),
          code: "YAML_PARSE_ERROR",
          data: { yamlString: yamlString.substring(0, 200) + "..." },
        },
      ],
      warnings: [],
    };
  }
}
