import { useState, useEffect } from "react";
import type { FieldComponentProps } from "#components/NodeFieldRenderer/types";

export function JsonField({
  fieldKey,
  config,
  value,
  onChange,
  disabled = false,
}: FieldComponentProps) {
  const [textValue, setTextValue] = useState(() => {
    try {
      return JSON.stringify(value, null, 2) || "";
    } catch {
      return "";
    }
  });
  const [error, setError] = useState<string | null>(null);

  // Update text when value changes externally
  useEffect(() => {
    try {
      setTextValue(JSON.stringify(value, null, 2) || "");
    } catch {
      // Keep existing text value
    }
  }, [value]);

  const handleChange = (text: string) => {
    setTextValue(text);

    // Allow empty strings
    if (text.trim() === "") {
      onChange(undefined);
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      onChange(parsed);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  return (
    <div className="space-y-1">
      <label htmlFor={fieldKey} className="block text-sm font-medium">
        {config.label}
        {config.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={fieldKey}
        value={textValue}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        rows={config.rows || 6}
        className={`w-full px-3 py-2 border rounded font-mono text-xs ${
          error ? "border-red-500" : ""
        }`}
        placeholder='{"key": "value"}'
        data-testid={`field-${fieldKey}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {!error && config.helpText && (
        <p className="text-xs text-gray-500">{config.helpText}</p>
      )}
    </div>
  );
}
