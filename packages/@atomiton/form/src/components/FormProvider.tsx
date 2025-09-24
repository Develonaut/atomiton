import React, { createContext, useContext, useEffect } from "react";
import { FormProvider as RHFFormProvider } from "react-hook-form";
import { useForm as useAtomitonForm } from "#hooks/useForm";
import type { FieldsMetadata, FieldConfig, ZodSchema } from "#types";

type FormContextValue = {
  generatedFields: FieldConfig[];
};

const FormContext = createContext<FormContextValue | null>(null);

export const useFormFields = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormFields must be used within a FormProvider");
  }
  return context;
};

type FormProviderProps = {
  children: React.ReactNode;
  schema: ZodSchema;
  defaultValues?: Record<string, unknown>;
  fields?: FieldsMetadata;
  onChange?: (data: Record<string, unknown>) => void;
};

/**
 * FormProvider Component
 *
 * Provides form context to all child components, including access to
 * generated fields and form methods.
 */
export const FormProvider = React.memo<FormProviderProps>(
  ({ children, schema, defaultValues = {}, fields = {}, onChange }) => {
    const form = useAtomitonForm({
      schema: schema as ZodSchema,
      defaultValues,
      fields,
    });

    const { watch, fields: generatedFields, ...formMethods } = form;

    // Optimized change detection using React Hook Form's subscription
    useEffect(() => {
      if (!onChange) return;

      const subscription = watch((data, { type }) => {
        // Only notify on actual field changes, not on initial setup
        if (type === "change") {
          onChange(data as Record<string, unknown>);
        }
      });

      return () => subscription.unsubscribe();
    }, [watch, onChange]);

    return (
      <FormContext.Provider value={{ generatedFields }}>
        <RHFFormProvider {...formMethods} watch={watch}>
          {children}
        </RHFFormProvider>
      </FormContext.Provider>
    );
  },
);

FormProvider.displayName = "FormProvider";
