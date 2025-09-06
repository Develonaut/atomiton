/**
 * Calculate style props with state considerations
 * Pure function that prepares props for CVA styles
 */
export function calculateStyleProps(
  props: Record<string, any>,
): Record<string, any> {
  return {
    ...props,
    // Common state calculations for CVA
    disabled: props.disabled || props.loading,
    loading: props.loading,
  };
}
