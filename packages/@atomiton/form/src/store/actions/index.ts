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
import type { store as storeApi } from "@atomiton/store";
import type { FieldValues } from "../../types/index.js";
import type { FormStoreState } from "../types.js";

export function createFormActions<T extends FieldValues = FieldValues>(
  store: ReturnType<typeof storeApi.createStore<FormStoreState<T>>>,
) {
  const validateField = createValidateField(store);
  const validate = createValidate(store, { validateField });
  const reset = createReset(store);

  const actions = {
    setFieldValue: createSetFieldValue(store, { validateField }),
    setFieldError: createSetFieldError(store),
    setFieldTouched: createSetFieldTouched(store, { validateField }),
    setValues: createSetValues(store, { validate }),
    setErrors: createSetErrors(store),
    reset,
    registerValidator: createRegisterValidator(store),
    validateField,
    validate,
    submit: createSubmit(store, { validate, reset }),
  };

  return actions;
}
