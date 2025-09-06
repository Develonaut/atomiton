/**
 * Calculate style props with state considerations
 * Pure function that prepares props for CVA styles
 */
export function calculateStyleProps(
  props: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...props,
    // Common state calculations for CVA
    disabled: props.disabled || props.loading,
    loading: props.loading,
  };
}
