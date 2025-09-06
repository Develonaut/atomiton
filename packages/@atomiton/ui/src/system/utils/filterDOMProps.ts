/**
 * List of props that should be filtered out when passing to DOM elements
 * These are custom props that are not valid HTML attributes
 */
const INVALID_DOM_PROPS = new Set([
  // Component-specific props
  "variant",
  "size",
  "loading",
  "asChild",

  // Legacy Brainwave props
  "isPrimary",
  "isSecondary",
  "isOrange",
  "isSmall",
  "isLarge",

  // State props
  "active",
  "selected",
  "checked",
  "pressed",
  "expanded",
  "invalid",
  "required",
  "readOnly",

  // System props that aren't valid DOM attributes
  "m",
  "mt",
  "mr",
  "mb",
  "ml",
  "mx",
  "my",
  "p",
  "pt",
  "pr",
  "pb",
  "pl",
  "px",
  "py",
  "bg",
  "bgColor",
  "w",
  "h",
  "minW",
  "maxW",
  "minH",
  "maxH",
  "boxSize",
  "ms",
  "me",
  "ps",
  "pe",
  "mx",
  "my",
  "px",
  "py",
  "insetX",
  "insetY",
  "flexDirection",
  "flexWrap",
  "justifyContent",
  "alignItems",
  "alignContent",
  "alignSelf",
  "flexGrow",
  "flexShrink",
  "flexBasis",
  "rowGap",
  "columnGap",
  "gridTemplate",
  "gridTemplateColumns",
  "gridTemplateRows",
  "gridColumn",
  "gridRow",
  "rounded",
  "boxSizing",
  "overflowX",
  "overflowY",
  "textTransform",
  "textDecoration",
  "textAlign",
  "fontStyle",
  "fontWeight",
  "fontSize",
  "lineHeight",
  "letterSpacing",
  "fontFamily",
  "borderWidth",
  "borderStyle",
  "borderColor",
  "borderRadius",
  "borderTop",
  "borderRight",
  "borderBottom",
  "borderLeft",
  "boxShadow",
  "shadow",
  "textShadow",

  // Layout helper props
  "fullWidth",
  "fullHeight",
]);

/**
 * Filter out non-DOM props when rendering as HTML element
 * Pure function that returns props safe to pass to DOM elements
 */
export function filterDOMProps<T extends Record<string, unknown>>(
  props: T,
  isHTMLElement: boolean,
): T {
  if (!isHTMLElement) {
    // For React components, pass all props
    return props;
  }

  // For HTML elements, filter out invalid props
  const filtered: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (!INVALID_DOM_PROPS.has(key)) {
      filtered[key] = value;
    }
  }

  return filtered as T;
}
