import { FormFields } from "#components/FormFields";
import { FormProvider } from "#components/FormProvider";
import type { FieldsMetadata, ZodSchema } from "#types";
import React from "react";

type FormProps = {
  schema: ZodSchema; // Zod schema from node config
  defaultValues?: Record<string, unknown>;
  fields?: FieldsMetadata;
  onChange?: (data: Record<string, unknown>) => void;
  className?: string;
};

/**
 * Simple Form Component
 *
 * Renders form fields based on schema and calls onChange when values change.
 * No submit functionality - designed for real-time store updates.
 *
 * ```tsx
 * <Form
 *   schema={schema}
 *   onChange={(data) => updateStore(data)}
 * />
 * ```
 */
const Form = React.memo<FormProps>(
  ({ schema, defaultValues = {}, fields = {}, onChange, className = "" }) => {
    return (
      <FormProvider
        schema={schema}
        defaultValues={defaultValues}
        fields={fields}
        onChange={onChange}
      >
        <div className={`flex flex-col gap-4 ${className}`}>
          <FormFields />
        </div>
      </FormProvider>
    );
  },
);

Form.displayName = "Form";

export default Form;
