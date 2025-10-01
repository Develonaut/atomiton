/**
 * Edit Fields Schema
 * Runtime validation schema for edit fields node
 */

import v, { jsonString } from "@atomiton/validation";
import type { VInfer } from "@atomiton/validation";
import { baseSchema } from "#schemas/node";

/**
 * Edit Fields specific schema (without base fields)
 */
export const editFieldsSchemaShape = {
  values: v
    .union([v.record(v.unknown()), jsonString(v.record(v.unknown()))])
    .default({})
    .describe(
      "Object containing field names and their values to set or edit (object or JSON string)",
    ),

  keepOnlySet: v
    .boolean()
    .default(false)
    .describe(
      "If true, only output the fields defined in values, discarding all other input fields",
    ),
};

/**
 * Full Edit Fields schema including base fields
 */
export const editFieldsSchema = baseSchema.extend(editFieldsSchemaShape);

/**
 * Type for Edit Fields parameters
 */
export type EditFieldsParameters = VInfer<typeof editFieldsSchema>;

/**
 * Default export for registry
 */
export default editFieldsSchemaShape;
