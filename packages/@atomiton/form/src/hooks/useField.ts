import type { useForm } from "./useForm";

export function useField({
  name,
  form,
}: {
  name: string;
  form: ReturnType<typeof useForm>;
}) {
  const {
    register,
    formState: { errors, touchedFields },
    watch,
    setValue,
    clearErrors,
  } = form;

  const value = watch(name);
  const error = errors[name];
  const touched = touchedFields[name];

  return {
    ...register(name),
    value,
    error,
    touched,
    hasError: !!error,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue: (value: any) => {
      setValue(name, value);
      if (error) {
        clearErrors(name);
      }
    },
  };
}
