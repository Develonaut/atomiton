import React, { useEffect, useMemo, useCallback } from "react";
import { useForm as useAtomitonForm } from "../hooks/useForm.js";
import type { FieldConfig, FieldsMetadata } from "../types.js";
import { Button } from "@atomiton/ui";
import { FieldRenderer } from "./FieldRenderer.js";

interface FormProps {
  schema: any; // Zod schema from node config
  defaultValues?: Record<string, unknown>;
  fields?: FieldsMetadata;
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  onChange?: (data: Record<string, unknown>) => void;
  submitButtonText?: string;
  showSubmitButton?: boolean;
  className?: string;
}

/**
 * Dynamic Form Component
 *
 * Automatically generates form fields based on a Zod schema and field metadata.
 * Integrates with the @atomiton/form package for validation and state management.
 */
const Form = React.memo<FormProps>(
  ({
    schema,
    defaultValues = {},
    fields = {},
    onSubmit,
    onChange,
    submitButtonText = "Save",
    showSubmitButton = true,
    className = "",
  }) => {
    const form = useAtomitonForm({
      schema,
      defaultValues,
      fields,
    });

    const {
      register,
      handleSubmit,
      watch,
      setValue,
      formState: { errors, isSubmitting },
      fields: generatedFields,
    } = form;

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

    // Memoize field components to prevent unnecessary re-renders
    const fieldComponents = useMemo(
      () =>
        Object.entries(generatedFields).map(([fieldName, fieldConfig]) => (
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
      [generatedFields, register, errors, watch, setValue],
    );

    // Memoize the submit handler
    const memoizedHandleSubmit = useCallback(handleSubmit(onSubmit), [
      handleSubmit,
      onSubmit,
    ]);

    return (
      <form
        className={`flex flex-col gap-4 ${className}`}
        onSubmit={memoizedHandleSubmit}
      >
        {fieldComponents}

        {/* Submit button */}
        {showSubmitButton && (
          <Button type="submit" loading={isSubmitting} className="w-full mt-4">
            {isSubmitting ? "Saving..." : submitButtonText}
          </Button>
        )}
      </form>
    );
  },
);

Form.displayName = "Form";

export default Form;
