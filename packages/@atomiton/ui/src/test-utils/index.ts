export * from "./mocks";

/**
 * Test utility to render and get class names
 */
function getClassNames(
  element: React.ReactElement<Record<string, unknown>>,
): string[] {
  const className = element.props?.className as string | undefined;
  if (!className) return [];
  return className.split(" ").filter(Boolean);
}

/**
 * Test utility to check if element has specific class
 */
function hasClass(
  element: React.ReactElement<Record<string, unknown>>,
  className: string,
): boolean {
  return getClassNames(element).includes(className);
}

/**
 * Test utility to get data attributes
 */
function getDataAttributes(
  element: React.ReactElement<Record<string, unknown>>,
): Record<string, unknown> {
  const props = element.props as Record<string, unknown>;
  const dataAttrs: Record<string, unknown> = {};

  if (!props) return dataAttrs;

  Object.keys(props).forEach((key) => {
    if (key.startsWith("data-")) {
      dataAttrs[key] = props[key];
    }
  });

  return dataAttrs;
}
