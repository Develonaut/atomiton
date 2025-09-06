/**
 * Generate data attributes for state visualization
 * Pure function that takes props and returns data attributes object
 */
export function generateDataAttributes(
  props: Record<string, any>,
): Record<string, any> {
  const dataAttributes: Record<string, any> = {};

  // Add common data attributes
  if (props.variant) dataAttributes["data-variant"] = props.variant;
  if (props.size) dataAttributes["data-size"] = props.size;
  if (props.loading) dataAttributes["data-loading"] = true;
  if (props.disabled || props.loading) dataAttributes["data-disabled"] = true;
  if (props.active) dataAttributes["data-active"] = true;
  if (props.selected) dataAttributes["data-selected"] = true;
  if (props.checked) dataAttributes["data-checked"] = true;
  if (props.expanded) dataAttributes["data-expanded"] = true;
  if (props.pressed) dataAttributes["data-pressed"] = true;
  if (props.invalid) dataAttributes["data-invalid"] = true;
  if (props.required) dataAttributes["data-required"] = true;
  if (props.readOnly) dataAttributes["data-readonly"] = true;

  return dataAttributes;
}
