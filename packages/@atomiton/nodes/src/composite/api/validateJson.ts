import type { ValidationResult } from "../types";
import type { JsonCompositeDefinition } from "../serializer/types";
import { fromJson } from "./fromJson";
import { validate } from "./validate";

export function validateJson(
  jsonData: JsonCompositeDefinition,
): ValidationResult {
  try {
    const composite = fromJson(jsonData);
    return validate(composite);
  } catch (error) {
    return {
      success: false,
      data: undefined,
      errors: [
        {
          path: jsonData.id || "unknown",
          message: error instanceof Error ? error.message : String(error),
          code: "PARSE_ERROR",
          data: jsonData,
        },
      ],
      warnings: [],
    };
  }
}
