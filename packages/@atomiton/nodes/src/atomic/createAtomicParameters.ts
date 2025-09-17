/**
 * Factory function for creating atomic node parameters
 */

import v from "@atomiton/validation";
import type { VRawShape, VObject, VInfer } from "@atomiton/validation";
import type {
  FieldsConfig,
  INodeParameters,
} from "../interfaces/INodeParameters";

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
  fields: FieldsConfig;
};

export function createAtomicParameters<T extends VRawShape>(
  nodeSchema: T,
  defaults: VInfer<VObject<T>>,
  fields: FieldsConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Complex Zod type inference requires any for proper type composition
): INodeParameters<any> {
  const fullSchema = baseSchema.extend(nodeSchema);
  type FullType = VInfer<typeof fullSchema>;

  const fullDefaults: FullType = {
    enabled: true,
    timeout: 30000,
    retries: 1,
    ...defaults,
  } as FullType;

  return {
    schema: fullSchema,
    defaults: fullDefaults,
    fields,

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
