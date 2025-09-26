/**
 * Edit Fields Node Executable
 * Node.js implementation for editing or creating data fields
 */

import Handlebars from "handlebars";
import { createNodeExecutable } from "#core/factories/createNodeExecutable";
import type {
  NodeExecutable,
  NodeExecutionContext,
  NodeExecutionResult,
} from "#core/types/executable";
import { getNodeSchema } from "#schemas/registry";
import type { EditFieldsParameters } from "#schemas/edit-fields";

/**
 * Edit Fields node executable
 */
export const editFieldsExecutable: NodeExecutable<EditFieldsParameters> =
  createNodeExecutable({
    async execute(
      context: NodeExecutionContext,
      config: EditFieldsParameters,
    ): Promise<NodeExecutionResult> {
      try {
        const inputData = context.inputs?.data || {};

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

        context.log?.info?.("Fields edited successfully", {
          fieldsEdited: Object.keys(config.values || {}),
          keepOnlySet: config.keepOnlySet,
          outputFieldCount: Object.keys(outputData).length,
        });

        return {
          success: true,
          outputs: {
            data: outputData,
          },
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        context.log?.error?.("Edit fields failed", {
          error: errorMessage,
        });

        return {
          success: false,
          error: errorMessage,
          outputs: {
            data: {},
          },
        };
      }
    },

    validateConfig(config: unknown): EditFieldsParameters {
      const schema = getNodeSchema("edit-fields");
      if (!schema) {
        throw new Error("Edit Fields schema not found in registry");
      }
      const result = schema.safeParse(config);
      if (!result.success) {
        throw new Error(
          `Invalid edit fields parameters: ${result.error?.message || "Unknown validation error"}`,
        );
      }
      return result.data as EditFieldsParameters;
    },
  });

export default editFieldsExecutable;
