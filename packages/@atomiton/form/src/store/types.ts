import type {
  FieldValues,
  FormState,
  FormConfig,
  FormErrors,
  ValidatorFunction,
  ValidationResult,
  FieldError,
} from "../types/index.js";

export type FormStoreState<T extends FieldValues = FieldValues> = {
  formId: string;
  config: FormConfig<T>;
  validators: Map<keyof T, ValidatorFunction[]>;
} & FormState<T>;

export type FormStoreActions<T extends FieldValues = FieldValues> = {
  setFieldValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldError: (field: keyof T, error: FieldError | undefined) => void;
  setFieldTouched: (field: keyof T, touched: boolean) => void;
  setValues: (values: Partial<T>) => void;
  setErrors: (errors: FormErrors<T>) => void;
  reset: (values?: Partial<T>) => void;
  registerValidator: (field: keyof T, validator: ValidatorFunction) => void;
  validateField: (
    field: keyof T,
    value?: T[keyof T],
  ) => Promise<ValidationResult>;
  validate: () => Promise<boolean>;
  submit: (onSubmit: (values: T) => void | Promise<void>) => Promise<void>;
};

export type FormStore<T extends FieldValues = FieldValues> = {
  formId: string;
  getState: () => FormStoreState<T>;
  setState: (updater: (state: FormStoreState<T>) => void) => void;
  subscribe: (
    callback: (state: FormStoreState<T>, prevState: FormStoreState<T>) => void,
  ) => () => void;
} & FormStoreState<T> &
  FormStoreActions<T>;
