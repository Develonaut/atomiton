import type { store as storeApi } from "@atomiton/store";
import type { FieldValues, ValidatorFunction } from "../../types/index.js";
import type { FormStoreState } from "../types.js";

export function createRegisterValidator<T extends FieldValues = FieldValues>(
  store: ReturnType<typeof storeApi.createStore<FormStoreState<T>>>,
): (field: keyof T, validator: ValidatorFunction) => void {
  return (field: keyof T, validator: ValidatorFunction) => {
    store.setState((state) => {
      const validators = state.validators.get(field) || [];
      validators.push(validator);
      state.validators.set(field, validators);
    });
  };
}
