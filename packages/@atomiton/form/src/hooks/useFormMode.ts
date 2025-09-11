import type { ReactNode } from "react";
import type {
  FormConfig,
  FieldValues,
  ValidatorRecord,
} from "../types/index.js";

// Simple mode props - direct individual props
interface SimpleFormProps<T extends FieldValues = FieldValues> {
  initialValues?: Partial<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  resetOnSubmitSuccess?: boolean;
  onSubmit?: (values: T) => void | Promise<void>;
  validators?: ValidatorRecord<T>;
  children: ReactNode;
}

// Advanced mode props - config object
interface AdvancedFormProps<T extends FieldValues = FieldValues> {
  config: FormConfig<T>;
  onSubmit?: (values: T) => void | Promise<void>;
  validators?: ValidatorRecord<T>;
  children: ReactNode;
}

type FormProps<T extends FieldValues = FieldValues> =
  | SimpleFormProps<T>
  | AdvancedFormProps<T>;

interface UseFormModeReturn<T extends FieldValues = FieldValues> {
  config: FormConfig<T>;
  onSubmit?: (values: T) => void | Promise<void>;
  validators?: ValidatorRecord<T>;
  children: ReactNode;
  isAdvanced: boolean;
}

function isAdvancedMode<T extends FieldValues>(
  props: FormProps<T>,
): props is AdvancedFormProps<T> {
  return "config" in props;
}

export function useFormMode<T extends FieldValues = FieldValues>(
  props: FormProps<T>,
): UseFormModeReturn<T> {
  // Detect mode and extract appropriate props
  let config: FormConfig<T>;
  let onSubmit: ((values: T) => void | Promise<void>) | undefined;
  let validators: ValidatorRecord<T> | undefined;
  let children: ReactNode;

  if (isAdvancedMode(props)) {
    // Advanced mode: config object provided
    config = props.config;
    onSubmit = props.onSubmit;
    validators = props.validators;
    children = props.children;
  } else {
    // Simple mode: individual props provided
    const {
      initialValues,
      validateOnChange = true,
      validateOnBlur = true,
      validateOnSubmit = true,
      resetOnSubmitSuccess = false,
    } = props;

    config = {
      initialValues,
      validateOnChange,
      validateOnBlur,
      validateOnSubmit,
      resetOnSubmitSuccess,
    } as FormConfig<T>;

    onSubmit = props.onSubmit;
    validators = props.validators;
    children = props.children;
  }

  return {
    config,
    onSubmit,
    validators,
    children,
    isAdvanced: isAdvancedMode(props),
  };
}
