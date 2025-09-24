import type { VInfer } from "@atomiton/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm as useHookForm } from "react-hook-form";
import type { FieldConfig, FieldsMetadata, ZodSchema } from "#types";
import { generateFieldsFromSchema, getDefaultValues } from "#utils/index";

export type UseFormOptions<T extends ZodSchema = ZodSchema> = {
  schema: T;
  defaultValues?: Partial<VInfer<T>>;
  fields?: FieldsMetadata;
};

export function useForm(options: UseFormOptions) {
  const { schema, defaultValues, fields = {} } = options;

  const resolvedDefaultValues = defaultValues ?? getDefaultValues(schema);

  const form = useHookForm({
    resolver: zodResolver(schema),
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
