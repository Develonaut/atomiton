/**
 * Factory function for creating type-safe node parameters
 */

import { z } from "zod";
import type { INodeParameters } from "./INodeParameters";
import type { FieldsConfig } from "./INodeParameters";

// Base schema that all nodes share
const baseSchema = z.object({
  enabled: z
    .boolean()
    .default(true)
    .describe("Whether this node is enabled for execution"),

  timeout: z
    .number()
    .positive()
    .default(30000)
    .describe("Maximum execution time in milliseconds"),

  retries: z
    .number()
    .int()
    .min(0)
    .default(1)
    .describe("Number of retry attempts on failure"),

  label: z.string().optional().describe("Custom label for this node instance"),

  description: z
    .string()
    .optional()
    .describe("Custom description for this node instance"),
});

export type NodeParametersInput<T extends z.ZodRawShape> = {
  nodeSchema: T;
  defaults: z.infer<z.ZodObject<T>>;
  fields: FieldsConfig;
};

export function createNodeParameters<T extends z.ZodRawShape>(
  nodeSchema: T,
  defaults: z.infer<z.ZodObject<T>>,
  fields: FieldsConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Complex Zod type inference requires any for proper type composition
): INodeParameters<any> {
  const fullSchema = baseSchema.extend(nodeSchema);
  type FullType = z.infer<typeof fullSchema>;

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
