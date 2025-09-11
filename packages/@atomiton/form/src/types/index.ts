export type FieldValue = string | number | boolean | Date | null | undefined;
export type FieldValues = Record<string, FieldValue>;

export type ValidationResult = {
  valid: boolean;
  error?: string;
};

export type ValidatorFunction<T = FieldValue> = (
  value: T,
  values?: FieldValues,
) => ValidationResult | Promise<ValidationResult>;

export type FieldError = {
  message: string;
  type?: string;
};

export type FormErrors<T extends FieldValues = FieldValues> = {
  [K in keyof T]?: FieldError;
};

export type FormState<T extends FieldValues = FieldValues> = {
  values: T;
  errors: FormErrors<T>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  isDirty: boolean;
  submitCount: number;
};

export type FormConfig<T extends FieldValues = FieldValues> = {
  initialValues: T;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  defaultValues?: Partial<T>;
  resetOnSubmitSuccess?: boolean;
};

export type FormFieldProps<T = FieldValue> = {
  name: string;
  value: T;
  error?: FieldError;
  touched: boolean;
  onChange: (value: T) => void;
  onBlur: () => void;
  onFocus: () => void;
};

export type SubmitHandler<T extends FieldValues = FieldValues> = (
  values: T,
) => void | Promise<void>;

export type FormHelpers<T extends FieldValues = FieldValues> = {
  setFieldValue: (name: keyof T, value: T[keyof T]) => void;
  setFieldError: (name: keyof T, error: FieldError | undefined) => void;
  setFieldTouched: (name: keyof T, touched: boolean) => void;
  setValues: (values: Partial<T>) => void;
  setErrors: (errors: FormErrors<T>) => void;
  reset: (values?: Partial<T>) => void;
  validate: () => Promise<boolean>;
  validateField: (name: keyof T) => Promise<ValidationResult>;
  submit: (onSubmit: (values: T) => void | Promise<void>) => Promise<void>;
};

export type FormAdvancedProps<T extends FieldValues = FieldValues> = {
  config: FormConfig<T>;
  onSubmit: SubmitHandler<T>;
  validators?: Record<keyof T, ValidatorFunction[]>;
  children: (props: {
    state: FormState<T>;
    helpers: FormHelpers<T>;
  }) => React.ReactNode;
};

export type FormSimpleProps<T extends FieldValues = FieldValues> = {
  initialValues: T;
  onSubmit: SubmitHandler<T>;
  validators?: Record<keyof T, ValidatorFunction[]>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  resetOnSubmitSuccess?: boolean;
  children: React.ReactNode;
};

export type FormProps<T extends FieldValues = FieldValues> =
  | FormAdvancedProps<T>
  | FormSimpleProps<T>;

export type AdvancedFormProps<T extends FieldValues = FieldValues> =
  FormAdvancedProps<T>;
