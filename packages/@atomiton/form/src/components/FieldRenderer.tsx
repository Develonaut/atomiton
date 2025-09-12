import React from "react";
import type {
  FieldError,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { FIELD_PROPERTY_EXTRACTORS } from "../constants.js";
import type { FieldConfig } from "../types.js";
import {
  BooleanField,
  JsonField,
  NumberField,
  SelectField,
  TextareaField,
  TextField,
} from "./fields/index.js";

type FieldRendererProps = {
  fieldName: string;
  fieldConfig: FieldConfig;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
};

export const FieldRenderer = React.memo<FieldRendererProps>(
  ({ fieldName, fieldConfig, register, errors, watch, setValue }) => {
    const error = errors[fieldName] as FieldError | undefined;
    const value = watch(fieldName);

    const controlType = fieldConfig.type || "text";
    const { label, placeholder, helpText, disabled } =
      FIELD_PROPERTY_EXTRACTORS.extractBaseProps(fieldName, fieldConfig);

    // Extract common props to reduce repetition
    const commonProps = {
      name: fieldName,
      label,
      placeholder,
      helpText,
      error,
      register,
      disabled,
    };

    const selectProps = {
      ...commonProps,
      value,
      onChange: (newValue: any) => setValue(fieldName, newValue),
      options: FIELD_PROPERTY_EXTRACTORS.extractOptions(fieldConfig),
    };

    const numericProps = {
      ...commonProps,
      ...FIELD_PROPERTY_EXTRACTORS.extractNumericProps(fieldConfig),
    };

    // Direct switch with JSX - most readable and performant approach
    switch (controlType) {
      case "select":
        return <SelectField {...selectProps} />;

      case "boolean":
        return <BooleanField {...commonProps} />;

      case "textarea":
        return <TextareaField {...commonProps} />;

      case "number":
        return <NumberField {...numericProps} />;

      case "json":
        return <JsonField {...commonProps} />;

      case "email":
        return <TextField {...commonProps} type="email" />;

      case "password":
        return <TextField {...commonProps} type="password" />;

      case "url":
        return <TextField {...commonProps} type="url" />;

      case "tel":
        return <TextField {...commonProps} type="tel" />;

      case "date":
        return <TextField {...commonProps} type="date" />;

      case "datetime":
        return <TextField {...commonProps} type="datetime-local" />;

      case "color":
        return <TextField {...commonProps} type="color" />;

      case "file":
        return <TextField {...commonProps} type="file" />;

      case "range":
        return <TextField {...numericProps} type="range" />;

      default:
        return <TextField {...commonProps} type="text" />;
    }
  },
);

FieldRenderer.displayName = "FieldRenderer";
