/**
 * Node Metadata Validation
 *
 * Validates metadata for any node type (atomic or composite)
 */

import type { Node } from "../types";
import type { ValidationError, ValidationResult } from "./types";

/**
 * Validate node metadata fields
 */
export function validateMetadata(metadata: Node["metadata"]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // If metadata is undefined, return success (it's optional)
  if (!metadata) {
    return { success: true, errors: [] };
  }

  try {
    // Validate timestamp formats if they exist
    if ("created" in metadata && metadata.created) {
      const created = new Date(metadata.created as string);
      if (isNaN(created.getTime())) {
        errors.push({
          path: "metadata.created",
          message: "Invalid created timestamp format",
          code: "INVALID_TIMESTAMP",
          data: { created: metadata.created },
        });
      }
    }

    if ("modified" in metadata && metadata.modified) {
      const modified = new Date(metadata.modified as string);
      if (isNaN(modified.getTime())) {
        errors.push({
          path: "metadata.modified",
          message: "Invalid modified timestamp format",
          code: "INVALID_TIMESTAMP",
          data: { modified: metadata.modified },
        });
      }
    }

    // Check logical consistency if both timestamps exist
    if (
      "created" in metadata &&
      metadata.created &&
      "modified" in metadata &&
      metadata.modified
    ) {
      const created = new Date(metadata.created as string);
      const modified = new Date(metadata.modified as string);

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

    // Validate source if present
    if (metadata.source) {
      const validSources = [
        "system",
        "user",
        "community",
        "organization",
        "marketplace",
      ];
      if (!validSources.includes(metadata.source)) {
        errors.push({
          path: "metadata.source",
          message: `Invalid source. Must be one of: ${validSources.join(", ")}`,
          code: "INVALID_SOURCE",
          data: { source: metadata.source },
        });
      }
    }

    // Validate variant if present
    if (metadata.variant && typeof metadata.variant !== "string") {
      errors.push({
        path: "metadata.variant",
        message: "Variant must be a string",
        code: "INVALID_VARIANT_TYPE",
        data: { variant: metadata.variant },
      });
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
