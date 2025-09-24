import type { useForm } from "#useForm";
import type { FieldPath, FieldValues } from "react-hook-form";

export function useField<TFieldValues extends FieldValues = FieldValues>({
  name,
  form,
}: {
  name: FieldPath<TFieldValues>;
  form: ReturnType<typeof useForm>;
}) {
  const {
    register,
    formState: { errors, touchedFields },
    watch,
    setValue,
    clearErrors,
  } = form;

  const value = watch(name as never);
  const error = errors[name as keyof typeof errors];
  const touched = touchedFields[name as keyof typeof touchedFields];

  return {
    ...register(name as never),
    value,
    error,
    touched,
    hasError: !!error,
    setValue: (value: unknown) => {
      setValue(name as never, value as never);
      if (error) {
        clearErrors(name as never);
      }
    },
  };
}
