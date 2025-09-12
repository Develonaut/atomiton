import React from "react";
import type {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
  FieldError,
} from "react-hook-form";
import type { FieldConfig } from "../types.js";
import {
  TextField,
  SelectField,
  BooleanField,
  NumberField,
  TextareaField,
  JsonField,
} from "./fields/index.js";

interface FieldRendererProps {
  fieldName: string;
  fieldConfig: FieldConfig;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

export const FieldRenderer = React.memo<FieldRendererProps>(
  ({ fieldName, fieldConfig, register, errors, watch, setValue }) => {
    const error = errors[fieldName] as FieldError | undefined;
    const value = watch(fieldName);

    const controlType = fieldConfig.type || "text";
    const label = fieldConfig.label || fieldName;
    const placeholder = fieldConfig.placeholder || "";
    const helpText = fieldConfig.helpText || "";
    const disabled = Boolean(fieldConfig.disabled);

    switch (controlType) {
      case "select":
        return (
          <SelectField
            name={fieldName}
            label={label}
            placeholder={placeholder}
            helpText={helpText}
            error={error}
            value={value}
            onChange={(newValue) => setValue(fieldName, newValue)}
            options={
              ("options" in fieldConfig ? fieldConfig.options : []) as Array<{
                label: string;
                value: string | number | boolean;
              }>
            }
            disabled={disabled}
          />
        );

      case "boolean":
        return (
          <BooleanField
            name={fieldName}
            label={label}
            helpText={helpText}
            error={error}
            register={register}
            disabled={disabled}
          />
        );

      case "textarea":
        return (
          <TextareaField
            name={fieldName}
            label={label}
            placeholder={placeholder}
            helpText={helpText}
            error={error}
            register={register}
            disabled={disabled}
          />
        );

      case "number":
        return (
          <NumberField
            name={fieldName}
            label={label}
            placeholder={placeholder}
            helpText={helpText}
            error={error}
            register={register}
            disabled={disabled}
            min={"min" in fieldConfig ? fieldConfig.min : undefined}
            max={"max" in fieldConfig ? fieldConfig.max : undefined}
            step={"step" in fieldConfig ? fieldConfig.step : undefined}
          />
        );

      case "json":
        return (
          <JsonField
            name={fieldName}
            label={label}
            placeholder={placeholder}
            helpText={helpText}
            error={error}
            register={register}
            disabled={disabled}
          />
        );

      default:
        // Map control types to HTML input types
        const inputType =
          controlType === "email"
            ? "email"
            : controlType === "password"
              ? "password"
              : controlType === "url"
                ? "url"
                : controlType === "tel"
                  ? "tel"
                  : controlType === "date"
                    ? "date"
                    : controlType === "datetime"
                      ? "datetime-local"
                      : controlType === "color"
                        ? "color"
                        : controlType === "file"
                          ? "file"
                          : "text";

        return (
          <TextField
            name={fieldName}
            label={label}
            placeholder={placeholder}
            helpText={helpText}
            error={error}
            register={register}
            disabled={disabled}
            type={inputType as any}
          />
        );
    }
  },
);

FieldRenderer.displayName = "FieldRenderer";
