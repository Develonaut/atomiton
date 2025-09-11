import {
  useEffect,
  useCallback,
  useMemo,
  Children,
  isValidElement,
  cloneElement,
} from "react";
import { useFormMode } from "../hooks/useFormMode.js";
import { useForm } from "../store/useForm.js";
import type {
  FieldValues,
  FormAdvancedProps,
  FormProps,
  ValidatorFunction,
} from "../types/index.js";

export function Form<T extends FieldValues = FieldValues>(props: FormProps<T>) {
  // Use hook to detect mode and normalize props
  const { config, onSubmit, validators, children } = useFormMode(props);

  const { state, helpers, store } = useForm<T>(config);

  useEffect(() => {
    if (validators) {
      Object.entries(validators).forEach(([field, fieldValidators]) => {
        (fieldValidators as ValidatorFunction[]).forEach((validator) => {
          store.registerValidator(field as keyof T, validator);
        });
      });
    }
  }, [validators, store]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      await store.submit(onSubmit);
    },
    [store, onSubmit],
  );

  // Clone children and inject formId prop for fields to use store directly
  const enhancedChildren = useMemo(() => {
    if (typeof children === "function") {
      return children({ state, helpers });
    }

    // Pass formId to all children so they can access the store directly
    // Only pass to components that expect it (not DOM elements)
    return Children.map(children, (child) => {
      if (isValidElement(child)) {
        // Check if it's a custom component (not DOM element)
        if (typeof child.type !== "string") {
          return cloneElement(child, { formId: store.formId } as {
            formId: string;
          });
        }
      }
      return child;
    });
  }, [children, helpers, store]);

  // For function children, we need to re-render when state changes,
  // but we don't want to use useMemo as it causes issues with local component state
  const finalChildren = typeof children === "function" 
    ? children({ state, helpers })
    : enhancedChildren;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {finalChildren}
    </form>
  );
}

export function AdvancedForm<T extends FieldValues = FieldValues>(
  props: FormAdvancedProps<T>,
) {
  return <Form<T> {...props} />;
}
