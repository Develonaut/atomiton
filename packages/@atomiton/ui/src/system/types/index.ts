export type SystemProps = {
  // Margin (industry standard)
  m?: number | string;
  mt?: number | string;
  mr?: number | string;
  mb?: number | string;
  ml?: number | string;
  mx?: number | string;
  my?: number | string;
  ms?: number | string; // margin-start (RTL support)
  me?: number | string; // margin-end (RTL support)

  // Padding (industry standard)
  p?: number | string;
  pt?: number | string;
  pr?: number | string;
  pb?: number | string;
  pl?: number | string;
  px?: number | string;
  py?: number | string;
  ps?: number | string; // padding-start (RTL support)
  pe?: number | string; // padding-end (RTL support)

  // Layout - Width/Height
  w?: number | string;
  width?: number | string;
  h?: number | string;
  height?: number | string;
  minW?: number | string;
  minWidth?: number | string;
  maxW?: number | string;
  maxWidth?: number | string;
  minH?: number | string;
  minHeight?: number | string;
  maxH?: number | string;
  maxHeight?: number | string;
  boxSize?: number | string; // width & height (use instead of 'size' to avoid conflicts with component variants)

  // Display & Box Model
  display?:
    | "none"
    | "block"
    | "inline"
    | "inline-block"
    | "flex"
    | "inline-flex"
    | "grid"
    | "inline-grid"
    | "table";
  overflow?: "visible" | "hidden" | "scroll" | "auto";
  overflowX?: "visible" | "hidden" | "scroll" | "auto";
  overflowY?: "visible" | "hidden" | "scroll" | "auto";
  boxSizing?: "border-box" | "content-box";

  // Position
  position?: "static" | "relative" | "absolute" | "fixed" | "sticky";
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  inset?: number | string; // all sides
  insetX?: number | string; // left & right
  insetY?: number | string; // top & bottom
  zIndex?: number | string;

  // Flexbox & Grid (industry standard names)
  flexDirection?: "row" | "row-reverse" | "column" | "column-reverse";
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse";
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  alignItems?: "flex-start" | "flex-end" | "center" | "baseline" | "stretch";
  alignContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "stretch";
  alignSelf?:
    | "auto"
    | "flex-start"
    | "flex-end"
    | "center"
    | "baseline"
    | "stretch";
  flex?: string | number;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: string | number;
  order?: number;
  gap?: number | string;
  rowGap?: number | string;
  columnGap?: number | string;
  gridTemplate?: string;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridColumn?: string;
  gridRow?: string;

  // Colors (industry standard)
  bg?: string;
  bgColor?: string;
  backgroundColor?: string;
  color?: string;
  opacity?: number | string;

  // Borders (commonly used)
  border?: string;
  borderWidth?: number | string;
  borderStyle?: string;
  borderColor?: string;
  borderRadius?: number | string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  rounded?: number | string; // alias for borderRadius

  // Typography (commonly used)
  fontSize?: number | string;
  fontWeight?: number | string;
  lineHeight?: number | string;
  letterSpacing?: number | string;
  textAlign?: "left" | "center" | "right" | "justify";
  fontFamily?: string;
  fontStyle?: "normal" | "italic" | "oblique";
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  textDecoration?: string;

  // Shadow & Effects
  boxShadow?: string;
  shadow?: string; // alias for boxShadow
  textShadow?: string;

  // Layout helpers
  fullWidth?: boolean;
  fullHeight?: boolean;
};
