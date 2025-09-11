import type { store as storeApi } from "@atomiton/store";
import type { FieldValues } from "../../types/index.js";
import type { FormStoreState, FormStoreActions } from "../types.js";

import { createSetFieldValue } from "./setFieldValue.js";
import { createSetFieldError } from "./setFieldError.js";
import { createSetFieldTouched } from "./setFieldTouched.js";
import { createSetValues } from "./setValues.js";
import { createSetErrors } from "./setErrors.js";
import { createReset } from "./reset.js";
import { createRegisterValidator } from "./registerValidator.js";
import { createValidateField } from "./validateField.js";
import { createValidate } from "./validate.js";
import { createSubmit } from "./submit.js";

export function createFormActions<T extends FieldValues = FieldValues>(
  store: ReturnType<typeof storeApi.createStore<FormStoreState<T>>>,
): FormStoreActions<T> {
  const validateField = createValidateField<T>(store);
  const validate = createValidate<T>(store, { validateField });
  const reset = createReset<T>(store);

  const actions: FormStoreActions<T> = {
    setFieldValue: createSetFieldValue<T>(store, { validateField }),
    setFieldError: createSetFieldError<T>(store),
    setFieldTouched: createSetFieldTouched<T>(store, { validateField }),
    setValues: createSetValues<T>(store, { validate }),
    setErrors: createSetErrors<T>(store),
    reset,
    registerValidator: createRegisterValidator<T>(store),
    validateField,
    validate,
    submit: createSubmit<T>(store, { validate, reset }),
  };

  return actions;
}
