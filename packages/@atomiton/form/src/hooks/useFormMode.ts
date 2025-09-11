import type {
  FieldValues,
  FormAdvancedProps,
  FormConfig,
  FormProps,
  SubmitHandler,
  ValidatorFunction,
} from "../types/index.js";

function isAdvancedMode<T extends FieldValues>(
  props: FormProps<T>,
): props is FormAdvancedProps<T> {
  return "config" in props;
}

export function useFormMode<T extends FieldValues = FieldValues>(
  props: FormProps<T>,
) {
  // Detect mode and extract appropriate props
  let config: FormConfig<T>;
  let onSubmit: SubmitHandler<T>;
  let validators: Record<keyof T, ValidatorFunction[]> | undefined;
  let children: FormProps<T>["children"];

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
    };
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
