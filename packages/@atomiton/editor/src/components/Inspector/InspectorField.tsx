import { styled } from "@atomiton/ui";
import type { InspectorFieldProps } from "./Inspector.types";

const InspectorFieldStyled = styled("div", {
  name: "InspectorField",
})("space-y-2");

const FieldLabelStyled = styled("label", {
  name: "InspectorFieldLabel",
})("block text-sm font-medium text-text-primary");

const FieldInputStyled = styled("input", {
  name: "InspectorFieldInput",
})(
  [
    "w-full",
    "px-3",
    "py-2",
    "text-sm",
    "rounded",
    "border",
    "bg-surface-01",
    "transition-all",
    "duration-200",
    "focus:outline-none",
    "focus:ring-2",
  ],
  {
    variants: {
      error: {
        true: "border-status-error focus:ring-status-error/30",
        false:
          "border-s-01 focus:ring-accent-primary/30 focus:border-accent-primary",
      },
      readonly: {
        true: "bg-surface-02 cursor-not-allowed opacity-60",
        false: "hover:border-s-02",
      },
    },
    defaultVariants: {
      error: false,
      readonly: false,
    },
  },
);

const FieldDescriptionStyled = styled("p", {
  name: "InspectorFieldDescription",
})("text-xs text-text-secondary");

const FieldErrorStyled = styled("p", {
  name: "InspectorFieldError",
})("text-xs text-status-error");

const FieldTextareaStyled = styled("textarea", {
  name: "InspectorFieldTextarea",
})(
  [
    "w-full",
    "px-3",
    "py-2",
    "text-sm",
    "rounded",
    "border",
    "bg-surface-01",
    "transition-all",
    "duration-200",
    "focus:outline-none",
    "focus:ring-2",
  ],
  {
    variants: {
      error: {
        true: "border-status-error focus:ring-status-error/30",
        false:
          "border-s-01 focus:ring-accent-primary/30 focus:border-accent-primary",
      },
      readonly: {
        true: "bg-surface-02 cursor-not-allowed opacity-60",
        false: "hover:border-s-02",
      },
    },
    defaultVariants: {
      error: false,
      readonly: false,
    },
  },
);

const FieldSelectStyled = styled("select", {
  name: "InspectorFieldSelect",
})(
  [
    "w-full",
    "px-3",
    "py-2",
    "text-sm",
    "rounded",
    "border",
    "bg-surface-01",
    "transition-all",
    "duration-200",
    "focus:outline-none",
    "focus:ring-2",
  ],
  {
    variants: {
      error: {
        true: "border-status-error focus:ring-status-error/30",
        false:
          "border-s-01 focus:ring-accent-primary/30 focus:border-accent-primary",
      },
      readonly: {
        true: "bg-surface-02 cursor-not-allowed opacity-60",
        false: "hover:border-s-02",
      },
    },
    defaultVariants: {
      error: false,
      readonly: false,
    },
  },
);

/**
 * Inspector field - renders different input types based on field definition
 */
export function InspectorField({
  className,
  field,
  value,
  readonly = false,
  onChange,
  error,
  ...props
}: InspectorFieldProps) {
  const handleOnChange = (newValue: unknown) => {
    if (!readonly) {
      onChange?.(newValue);
    }
  };

  const renderInput = () => {
    const commonProps = {
      disabled: field.disabled || readonly,
      required: field.required,
      placeholder: field.placeholder,
    };

    switch (field.type) {
      case "text":
        return (
          <FieldInputStyled
            type="text"
            value={(value as string) || ""}
            onChange={(e) => handleOnChange(e.target.value)}
            error={!!error}
            readonly={readonly}
            {...commonProps}
          />
        );

      case "number":
        return (
          <FieldInputStyled
            type="number"
            value={(value as number) || ""}
            onChange={(e) => handleOnChange(Number(e.target.value))}
            min={field.min}
            max={field.max}
            step={field.step}
            error={!!error}
            readonly={readonly}
            {...commonProps}
          />
        );

      case "textarea":
        return (
          <FieldTextareaStyled
            value={(value as string) || ""}
            onChange={(e) => handleOnChange(e.target.value)}
            rows={field.rows || 3}
            error={!!error}
            readonly={readonly}
            {...commonProps}
          />
        );

      case "select":
        return (
          <FieldSelectStyled
            value={(value as string) || ""}
            onChange={(e) => handleOnChange(e.target.value)}
            error={!!error}
            readonly={readonly}
            {...commonProps}
          >
            {field.options?.map((option) => (
              <option key={String(option.value)} value={String(option.value)}>
                {option.label}
              </option>
            ))}
          </FieldSelectStyled>
        );

      case "checkbox":
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleOnChange(e.target.checked)}
              disabled={field.disabled || readonly}
              className="rounded border-s-01 text-accent-primary focus:ring-accent-primary"
            />
            <span className="text-sm text-text-primary">{field.label}</span>
          </label>
        );

      case "color":
        return (
          <FieldInputStyled
            type="color"
            value={(value as string) || "#000000"}
            onChange={(e) => handleOnChange(e.target.value)}
            error={!!error}
            readonly={readonly}
            className="h-10"
            {...commonProps}
          />
        );

      case "range":
        return (
          <div className="space-y-2">
            <input
              type="range"
              value={(value as number) || field.min || 0}
              onChange={(e) => handleOnChange(Number(e.target.value))}
              min={field.min}
              max={field.max}
              step={field.step}
              disabled={field.disabled || readonly}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-text-secondary">
              <span>{field.min}</span>
              <span>{String(value || "")}</span>
              <span>{field.max}</span>
            </div>
          </div>
        );

      default:
        return (
          <FieldInputStyled
            type="text"
            value={(value as string) || ""}
            onChange={(e) => handleOnChange(e.target.value)}
            error={!!error}
            readonly={readonly}
            {...commonProps}
          />
        );
    }
  };

  return (
    <InspectorFieldStyled
      className={className}
      data-field-key={field.key}
      data-field-type={field.type}
      data-readonly={readonly || undefined}
      {...props}
    >
      {field.type !== "checkbox" && (
        <FieldLabelStyled>
          {field.label}
          {field.required && <span className="text-status-error ml-1">*</span>}
        </FieldLabelStyled>
      )}

      {renderInput()}

      {field.description && (
        <FieldDescriptionStyled>{field.description}</FieldDescriptionStyled>
      )}

      {error && <FieldErrorStyled>{error}</FieldErrorStyled>}
    </InspectorFieldStyled>
  );
}
