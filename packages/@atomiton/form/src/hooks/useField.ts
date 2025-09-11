import { useCallback, useSyncExternalStore } from "react";
import { getFormStore, getDefaultFormId } from "../store/index.js";
import type { FieldValue, FormFieldProps } from "../types/index.js";

import { getNestedValue } from "../utils/object.js";

type UseFieldOptions<T = FieldValue> = {
  name: string;
  formId?: string;
  parse?: (value: unknown) => T;
  format?: (value: T) => unknown;
};

/**
 * Hook to connect a field to the form store
 * Provides optimized subscriptions to only re-render when the field's data changes
 */
export function useField<T = FieldValue>({
  name,
  formId,
  parse,
  format,
}: UseFieldOptions<T>): FormFieldProps<T> {
  const effectiveFormId = formId || getDefaultFormId();

  if (!effectiveFormId) {
    throw new Error(
      `No form store found. Either provide formId prop or ensure a Form component is mounted.`,
    );
  }

  const store = getFormStore<Record<string, FieldValue>>(effectiveFormId);

  if (!store) {
    throw new Error(`Form store "${effectiveFormId}" not found`);
  }

  // We use useSyncExternalStore here because:
  // 1. We're subscribing to an external Zustand store (from @atomiton/store)
  // 2. It provides granular subscriptions - only re-renders when THIS field changes
  // 3. The equality checks prevent unnecessary re-renders
  // 4. This is React's recommended pattern for external store subscriptions
  // While Zustand has its own hooks, our wrapped store API doesn't expose them directly,
  // so useSyncExternalStore gives us the same optimized performance benefits.
  const value = useSyncExternalStore(
    useCallback(
      (callback: () => void) => {
        let previousValue = getNestedValue(store.getState().values, name);

        return store.subscribe(() => {
          const currentValue = getNestedValue(store.getState().values, name);
          if (currentValue !== previousValue) {
            previousValue = currentValue;
            callback();
          }
        });
      },
      [store, name],
    ),
    () => getNestedValue(store.getState().values, name),
    () => getNestedValue(store.getState().values, name),
  ) as T;

  const error = useSyncExternalStore(
    useCallback(
      (callback: () => void) => {
        let previousError = store.getState().errors[name];

        return store.subscribe(() => {
          const currentError = store.getState().errors[name];
          if (currentError !== previousError) {
            previousError = currentError;
            callback();
          }
        });
      },
      [store, name],
    ),
    () => store.getState().errors[name],
    () => store.getState().errors[name],
  );

  const touched = useSyncExternalStore(
    useCallback(
      (callback: () => void) => {
        let previousTouched = store.getState().touched[name];

        return store.subscribe(() => {
          const currentTouched = store.getState().touched[name];
          if (currentTouched !== previousTouched) {
            previousTouched = currentTouched;
            callback();
          }
        });
      },
      [store, name],
    ),
    () => store.getState().touched[name] || false,
    () => store.getState().touched[name] || false,
  );

  const handleChange = useCallback(
    (newValue: T) => {
      const formattedValue = format ? format(newValue) : newValue;
      store.setFieldValue(name, formattedValue as FieldValue);

      // Validation happens asynchronously via setFieldValue if validateOnChange is enabled
    },
    [name, store, format],
  );

  const handleBlur = useCallback(() => {
    store.setFieldTouched(name, true);
    // Validation happens asynchronously via setFieldTouched if validateOnBlur is enabled
  }, [name, store]);

  const handleFocus = useCallback(() => {
    // Can be used for focus tracking if needed
  }, []);

  return {
    name,
    value: parse ? parse(value) : value,
    error,
    touched,
    onChange: handleChange,
    onBlur: handleBlur,
    onFocus: handleFocus,
  };
}
