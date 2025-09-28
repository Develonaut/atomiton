/**
 * Edit Fields Node Executable
 * Node.js implementation for editing or creating data fields
 */

import Handlebars from "handlebars";
import { createExecutable } from "#core/utils/executable";
import type { EditFieldsParameters } from "#schemas/edit-fields";

/**
 * Edit Fields node executable
 */
export const editFieldsExecutable = createExecutable<EditFieldsParameters>(
  "edit-fields",
  async ({ getInput, config, context }) => {
    const inputData = getInput<Record<string, unknown>>("data") || {};

    // Start with input data or empty object
    const outputData: Record<string, unknown> = config.keepOnlySet
      ? {}
      : { ...inputData };

    // Register common helpers
    Handlebars.registerHelper("$now", () => new Date().toISOString());

    // Apply the field edits with template processing
    if (config.values && typeof config.values === "object") {
      Object.entries(config.values).forEach(([key, value]) => {
        if (typeof value === "string") {
          const template = Handlebars.compile(value);
          outputData[key] = template(inputData);
        } else {
          outputData[key] = value;
        }
      });
    }

    context.log.info("Fields edited successfully", {
      fieldsEdited: Object.keys(config.values || {}),
      keepOnlySet: config.keepOnlySet,
      outputFieldCount: Object.keys(outputData).length,
    });

    return {
      data: outputData,
    };
  },
);

export default editFieldsExecutable;
