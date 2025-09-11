import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { createFormStore, deleteFormStore } from "./index.js";
import type { FormConfig, FieldValues, FormStore } from "../types/index.js";
import type { FormStoreState } from "./types.js";

let formIdCounter = 0;

// Optimized selector hook that only re-renders when the selected value changes
function useStoreSelector<T extends FieldValues, U>(
  store: FormStore<T>,
  selector: (state: FormStoreState<T>) => U,
): U {
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

export function useForm<T extends FieldValues = FieldValues>(
  config: FormConfig<T>,
  formId?: string,
) {
  const generatedFormId = useRef(formId || `form-${++formIdCounter}`);
  const storeRef = useRef<FormStore<T>>();

  if (!storeRef.current) {
    storeRef.current = createFormStore(generatedFormId.current, config);
  }

  const store = storeRef.current;

  const helpers = useMemo(
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
