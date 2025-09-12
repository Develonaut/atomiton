import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm as useHookForm } from "react-hook-form";
import type { FieldConfig, FieldsMetadata, ZodSchema } from "../types.js";
import { generateFieldsFromSchema, getDefaultValues } from "../utils/index.js";

export type UseFormOptions = {
  schema: ZodSchema;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValues?: any;
  fields?: FieldsMetadata;
};

export function useForm(options: UseFormOptions) {
  const { schema, defaultValues, fields = {} } = options;

  const resolvedDefaultValues = defaultValues ?? getDefaultValues(schema);

  const form = useHookForm({
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

  return useMemo(
    () => ({
      ...form,
      fields: generatedFields,
    }),
    [form, generatedFields],
  );
}
