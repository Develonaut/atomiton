import { useForm as useReactHookForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateFieldsFromSchema, getDefaultValues } from "../utils/index.js";
import type { FieldConfig, FieldsMetadata, ZodSchema } from "../types.js";

export type UseFormOptions = {
  schema: ZodSchema;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValues?: any;
  fields?: FieldsMetadata;
};

export function useForm(options: UseFormOptions) {
  const { schema, defaultValues, fields = {} } = options;

  const resolvedDefaultValues = defaultValues ?? getDefaultValues(schema);

  const form = useReactHookForm({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues: resolvedDefaultValues,
  });

  let generatedFields: FieldConfig[];
  try {
    generatedFields = generateFieldsFromSchema(schema, fields);
  } catch (error) {
    console.error("Error generating fields:", error);
    generatedFields = [];
  }

  return {
    ...form,
    fields: generatedFields,
  };
}
