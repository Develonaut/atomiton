import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import type { FieldConfig } from "../types.js";
import { FieldRenderer } from "./FieldRenderer.js";
import { useFormFields } from "./FormProvider.js";

type FormFieldsProps = {
  className?: string;
  fields?: Record<string, FieldConfig>;
};

/**
 * FormFields Component
 *
 * Renders all the dynamically generated form fields.
 * Must be used inside a Form component to access the form context.
 *
 * @example
 * ```tsx
 * <Form schema={schema} onSubmit={handleSubmit}>
 *   <h2>User Information</h2>
 *   <FormFields />
 *   <Button type="submit">Submit</Button>
 * </Form>
 * ```
 */
export const FormFields = React.memo<FormFieldsProps>(
  ({ className = "", fields }) => {
    const {
      register,
      formState: { errors },
      watch,
      setValue,
    } = useFormContext();

    const { generatedFields } = useFormFields();

    // Get fields from props or form context
    const fieldsToRender = fields || generatedFields || {};

    // Memoize field components to prevent unnecessary re-renders
    const fieldComponents = useMemo(
      () =>
        Object.entries(fieldsToRender).map(([fieldName, fieldConfig]) => (
          <FieldRenderer
            key={fieldName}
            fieldName={fieldName}
            fieldConfig={fieldConfig as FieldConfig}
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        )),
      [fieldsToRender, register, errors, watch, setValue],
    );

    return (
      <div className={`flex flex-col gap-4 ${className}`}>
        {fieldComponents}
      </div>
    );
  },
);

FormFields.displayName = "FormFields";
