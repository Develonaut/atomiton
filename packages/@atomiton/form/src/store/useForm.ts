import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import type { FieldValues, FormConfig, FormHelpers } from "../types/index.js";
import {
  createFormStore,
  deleteFormStore,
  type FormStore,
  type FormStoreState,
} from "./index.js";

let formIdCounter = 0;

// Optimized selector hook that only re-renders when the selected value changes
function useStoreSelector<TState, TSelected>(
  store: { subscribe: (fn: () => void) => () => void; getState: () => TState },
  selector: (state: TState) => TSelected,
): TSelected {
  return useSyncExternalStore(
    useMemo(
      () => (callback: () => void) => {
        let previousValue = selector(store.getState());

        return store.subscribe(() => {
          const currentValue = selector(store.getState());
          if (currentValue !== previousValue) {
            previousValue = currentValue;
            callback();
          }
        });
      },
      [store, selector],
    ),
    () => selector(store.getState()),
    () => selector(store.getState()),
  );
}

export type UseFormReturn<T extends FieldValues = FieldValues> = {
  state: FormStoreState<T>;
  helpers: FormHelpers<T>;
  store: FormStore<T>;
};

export function useForm<T extends FieldValues = FieldValues>(
  config: FormConfig<T>,
  formId?: string,
): UseFormReturn<T> {
  const generatedFormId = useRef(formId || `form-${++formIdCounter}`);
  const storeRef = useRef<FormStore<T>>();

  if (!storeRef.current) {
    storeRef.current = createFormStore<T>(generatedFormId.current, config);
  }

  const store = storeRef.current;

  const helpers = useMemo<FormHelpers<T>>(
    () => ({
      setFieldValue: store.setFieldValue.bind(store),
      setFieldError: store.setFieldError.bind(store),
      setFieldTouched: store.setFieldTouched.bind(store),
      setValues: store.setValues.bind(store),
      setErrors: store.setErrors.bind(store),
      reset: store.reset.bind(store),
      validate: store.validate.bind(store),
      validateField: store.validateField.bind(store),
      submit: store.submit.bind(store),
    }),
    [store],
  );

  useEffect(() => {
    return () => {
      if (!formId) {
        deleteFormStore(generatedFormId.current);
      }
    };
  }, [formId]);

  const state = useStoreSelector(store, (s) => s);

  return { state, helpers, store };
}
