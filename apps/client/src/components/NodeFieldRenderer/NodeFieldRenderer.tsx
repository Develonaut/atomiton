import type { JSX } from "react";
import { BooleanField } from "#components/NodeFieldRenderer/fields/BooleanField";
import { CodeField } from "#components/NodeFieldRenderer/fields/CodeField";
import { ColorField } from "#components/NodeFieldRenderer/fields/ColorField";
import { JsonField } from "#components/NodeFieldRenderer/fields/JsonField";
import { NumberField } from "#components/NodeFieldRenderer/fields/NumberField";
import { RangeField } from "#components/NodeFieldRenderer/fields/RangeField";
import { SelectField } from "#components/NodeFieldRenderer/fields/SelectField";
import { TextAreaField } from "#components/NodeFieldRenderer/fields/TextAreaField";
import { TextField } from "#components/NodeFieldRenderer/fields/TextField";
import type { NodeFieldRendererProps } from "#components/NodeFieldRenderer/types";

/**
 * Main field renderer component that routes to the appropriate
 * field component based on the control type
 */
export function NodeFieldRenderer({
  fieldKey,
  fieldConfig,
  value,
  onChange,
  disabled = false,
}: NodeFieldRendererProps): JSX.Element {
  const props = {
    fieldKey,
    config: fieldConfig,
    value,
    onChange,
    disabled,
  };

  switch (fieldConfig.controlType) {
    case "text":
    case "password":
    case "email":
    case "url":
      return <TextField {...props} />;

    case "textarea":
    case "markdown":
    case "rich-text":
      return <TextAreaField {...props} />;

    case "number":
      return <NumberField {...props} />;

    case "range":
      return <RangeField {...props} />;

    case "boolean":
      return <BooleanField {...props} />;

    case "select":
      return <SelectField {...props} />;

    case "date":
    case "datetime":
      // Use text field with appropriate type
      return <TextField {...props} />;

    case "color":
      return <ColorField {...props} />;

    case "json":
      return <JsonField {...props} />;

    case "code":
      return <CodeField {...props} />;

    case "file":
      // Use text field for file paths for now
      return <TextField {...props} />;

    default:
      // Fallback to text field
      return <TextField {...props} />;
  }
}
