/**
 * Factory function for creating node parameters
 */

import type {
  NodeFieldsConfig,
  NodeParameters,
} from "#core/types/definition.js";
import { isNodeParameters } from "#core/utils/nodeUtils.js";
import type { VInfer, VObject, VRawShape } from "@atomiton/validation";
import v from "@atomiton/validation";

// Base schema that all nodes share
const baseSchema = v.object({
  enabled: v
    .boolean()
    .default(true)
    .describe("Whether this node is enabled for execution"),

  timeout: v
    .number()
    .positive()
    .default(30000)
    .describe("Maximum execution time in milliseconds"),

  retries: v
    .number()
    .int()
    .min(0)
    .default(1)
    .describe("Number of retry attempts on failure"),

  label: v.string().optional().describe("Custom label for this node instance"),

  description: v
    .string()
    .optional()
    .describe("Custom description for this node instance"),
});

export type NodeParametersInput<T extends VRawShape> = {
  nodeSchema: T;
  defaults: VInfer<VObject<T>>;
  fields: NodeFieldsConfig;
};

function createNodeParameters<T extends VRawShape>(
  nodeSchemaOrParams: T | NodeParameters,
  defaults?: VInfer<VObject<T>>,
  fields?: NodeFieldsConfig
): NodeParameters<VInfer<VObject<T & typeof baseSchema.shape>>> {
  if (isNodeParameters(nodeSchemaOrParams)) {
    return nodeSchemaOrParams as NodeParameters<
      VInfer<VObject<T & typeof baseSchema.shape>>
    >;
  }

  const nodeSchema = nodeSchemaOrParams as T;
  const defaultValues = defaults || ({} as VInfer<VObject<T>>);
  const fieldConfig = fields || {};
  const fullSchema = baseSchema.extend(nodeSchema);
  type FullType = VInfer<typeof fullSchema>;

  const fullDefaults: FullType = {
    enabled: true,
    timeout: 30000,
    retries: 1,
    ...defaultValues,
  } as FullType;

  return {
    schema: fullSchema,
    defaults: fullDefaults,
    fields: fieldConfig,

    parse(params: unknown): FullType {
      return fullSchema.parse(params);
    },

    safeParse(params: unknown) {
      return fullSchema.safeParse(params);
    },

    isValid(params: unknown): boolean {
      return fullSchema.safeParse(params).success;
    },

    withDefaults(partialParams?: Partial<FullType>) {
      return {
        ...fullDefaults,
        ...partialParams,
      };
    },
  };
}

export { createNodeParameters };
export default createNodeParameters;
