import type { JSX } from "react";
import { BooleanField } from "./fields/BooleanField";
import { CodeField } from "./fields/CodeField";
import { ColorField } from "./fields/ColorField";
import { JsonField } from "./fields/JsonField";
import { NumberField } from "./fields/NumberField";
import { RangeField } from "./fields/RangeField";
import { SelectField } from "./fields/SelectField";
import { TextAreaField } from "./fields/TextAreaField";
import { TextField } from "./fields/TextField";
import type { NodeFieldRendererProps } from "./types";

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
    case "file":
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

    default:
      // Fallback to text field
      return <TextField {...props} />;
  }
}
