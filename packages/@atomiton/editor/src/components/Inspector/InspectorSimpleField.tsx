import { InspectorField } from "./InspectorField";
import type { FieldType } from "./Inspector.types";

interface InspectorSimpleFieldProps {
  name: string;
  label: string;
  type: FieldType;
  value?: unknown;
  onChange?: (value: unknown) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  className?: string;
}

/**
 * Simplified wrapper for InspectorField that accepts props directly
 * instead of a field object
 */
export function InspectorSimpleField({
  name,
  label,
  type,
  value,
  onChange,
  min,
  max,
  placeholder,
  className,
  ...props
}: InspectorSimpleFieldProps) {
  return (
    <InspectorField
      field={{
        key: name,
        label,
        type,
        min,
        max,
        placeholder,
      }}
      value={value}
      onChange={onChange}
      className={className}
      {...props}
    />
  );
}
