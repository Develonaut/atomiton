import { render } from "squirrelly";
import { createExecutable } from "#core/utils/executable";
import type { EditFieldsParameters } from "#schemas/edit-fields";

function extractVariables(template: string): string[] {
  const regex = /\{\{(?!@)([^}]+)\}\}/g;
  const variables: string[] = [];
  let match;
  while ((match = regex.exec(template)) !== null) {
    const varName = match[1].trim().split(".")[0].split(" ")[0];
    if (varName && !varName.startsWith("@") && varName !== "$now") {
      variables.push(varName);
    }
  }
  return [...new Set(variables)];
}

export const editFieldsExecutable = createExecutable<EditFieldsParameters>(
  "edit-fields",
  async ({ getInput, config, context }) => {
    const inputData = getInput<Record<string, unknown>>("data") || {};

    const outputData: Record<string, unknown> = config.keepOnlySet
      ? {}
      : { ...inputData };

    if (config.values && typeof config.values === "object") {
      Object.entries(config.values).forEach(([key, value]) => {
        if (typeof value === "string") {
          const variables = extractVariables(value);
          const safeData: Record<string, unknown> = { ...inputData };

          safeData.$now = new Date().toISOString();

          variables.forEach((varName) => {
            if (!(varName in safeData)) {
              safeData[varName] = "";
            }
          });

          outputData[key] = render(value, safeData, {
            useWith: true,
          });
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
      result: outputData,
    };
  },
);

export default editFieldsExecutable;
