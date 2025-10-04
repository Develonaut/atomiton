/**
 * Edit Fields Node Definition
 * Node for editing or creating data fields
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import type { NodeDefinition } from "#core/types/definition";
import { editFieldsFields } from "#definitions/edit-fields/fields";
import {
  editFieldsInputPorts,
  editFieldsOutputPorts,
} from "#definitions/edit-fields/ports";

/**
 * Default values for edit fields parameters
 */
export const editFieldsDefaults = {
  values: {
    message: "Hello World from Atomiton!",
    timestamp: "{{$now}}",
    author: "Atomiton Flow System",
  },
  keepOnlySet: false,
};

/**
 * Edit Fields node definition (browser-safe)
 */
export const editFieldsDefinition: NodeDefinition = createNodeDefinition({
  type: "edit-fields",
  version: "1.0.0",
  metadata: createNodeMetadata({
    id: "edit-fields",
    name: "Edit Fields",
    author: "Atomiton Core Team",
    description: "Edit existing fields or create new data fields",
    category: "data",
    icon: "pencil",
    keywords: ["edit", "fields", "data", "create", "modify", "values", "set"],
    tags: ["data", "fields", "edit", "simple", "beginner", "core"],
    experimental: false,
    deprecated: false,
  }),
  parameters: createNodeParameters(editFieldsDefaults),
  fields: editFieldsFields,
  inputPorts: editFieldsInputPorts,
  outputPorts: editFieldsOutputPorts,
});

export default editFieldsDefinition;
