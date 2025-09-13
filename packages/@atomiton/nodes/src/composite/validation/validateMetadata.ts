import type {
  CompositeDefinition,
  ValidationError,
  ValidationResult,
} from "../types";

/**
 * Validate metadata fields
 */
export function validateMetadata(
  metadata: CompositeDefinition["metadata"],
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  try {
    // Validate timestamp formats
    const created = new Date(metadata.created);
    const modified = new Date(metadata.modified);

    if (isNaN(created.getTime())) {
      errors.push({
        path: "metadata.created",
        message: "Invalid created timestamp format",
        code: "INVALID_TIMESTAMP",
        data: { created: metadata.created },
      });
    }

    if (isNaN(modified.getTime())) {
      errors.push({
        path: "metadata.modified",
        message: "Invalid modified timestamp format",
        code: "INVALID_TIMESTAMP",
        data: { modified: metadata.modified },
      });
    }

    // Check logical consistency
    if (!isNaN(created.getTime()) && !isNaN(modified.getTime())) {
      if (created > modified) {
        warnings.push({
          path: "metadata",
          message: "Created date is after modified date",
          code: "TIMESTAMP_INCONSISTENCY",
          data: { created: metadata.created, modified: metadata.modified },
        });
      }
    }

    // Validate tags if present
    if (metadata.tags) {
      if (!Array.isArray(metadata.tags)) {
        errors.push({
          path: "metadata.tags",
          message: "Tags must be an array of strings",
          code: "INVALID_TAGS_TYPE",
          data: { tags: metadata.tags },
        });
      } else {
        metadata.tags.forEach((tag, index) => {
          if (typeof tag !== "string") {
            errors.push({
              path: `metadata.tags[${index}]`,
              message: "Tag must be a string",
              code: "INVALID_TAG_TYPE",
              data: { tag, index },
            });
          }
        });
      }
    }
  } catch (error) {
    errors.push({
      path: "metadata",
      message:
        error instanceof Error ? error.message : "Metadata validation error",
      code: "METADATA_VALIDATION_ERROR",
      data: error,
    });
  }

  return {
    success: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
