import type { SystemProps } from "#system/types";

export type PropResolver = (value: string | number | boolean) => string;

export const systemPropsMap: Record<keyof SystemProps, PropResolver> = {
  // Margin (industry standard)
  m: (v) => `m-${v}`,
  mt: (v) => `mt-${v}`,
  mr: (v) => `mr-${v}`,
  mb: (v) => `mb-${v}`,
  ml: (v) => `ml-${v}`,
  mx: (v) => `mx-${v}`,
  my: (v) => `my-${v}`,
  ms: (v) => `ms-${v}`, // margin-inline-start (RTL)
  me: (v) => `me-${v}`, // margin-inline-end (RTL)

  // Padding (industry standard)
  p: (v) => `p-${v}`,
  pt: (v) => `pt-${v}`,
  pr: (v) => `pr-${v}`,
  pb: (v) => `pb-${v}`,
  pl: (v) => `pl-${v}`,
  px: (v) => `px-${v}`,
  py: (v) => `py-${v}`,
  ps: (v) => `ps-${v}`, // padding-inline-start (RTL)
  pe: (v) => `pe-${v}`, // padding-inline-end (RTL)

  // Layout - Width/Height
  w: (v) => `w-${v}`,
  width: (v) => `w-${v}`,
  h: (v) => `h-${v}`,
  height: (v) => `h-${v}`,
  minW: (v) => `min-w-${v}`,
  minWidth: (v) => `min-w-${v}`,
  maxW: (v) => `max-w-${v}`,
  maxWidth: (v) => `max-w-${v}`,
  minH: (v) => `min-h-${v}`,
  minHeight: (v) => `min-h-${v}`,
  maxH: (v) => `max-h-${v}`,
  maxHeight: (v) => `max-h-${v}`,
  boxSize: (v) => `size-${v}`, // Tailwind 3.4+ size utility - sets both width & height
  fullWidth: (v) => (v === true || v === "true" ? "w-full" : ""),
  fullHeight: (v) => (v === true || v === "true" ? "h-full" : ""),

  // Display & Box Model
  display: (v) => {
    const displays: Record<string, string> = {
      none: "hidden",
      block: "block",
      inline: "inline",
      "inline-block": "inline-block",
      flex: "flex",
      "inline-flex": "inline-flex",
      grid: "grid",
      "inline-grid": "inline-grid",
      table: "table",
    };
    return displays[String(v)] || "";
  },
  overflow: (v) => `overflow-${v}`,
  overflowX: (v) => `overflow-x-${v}`,
  overflowY: (v) => `overflow-y-${v}`,
  boxSizing: (v) => (v === "border-box" ? "box-border" : "box-content"),

  // Position
  position: (v) => {
    const positions: Record<string, string> = {
      static: "static",
      relative: "relative",
      absolute: "absolute",
      fixed: "fixed",
      sticky: "sticky",
    };
    return positions[String(v)] || "";
  },
  top: (v) => `top-${v}`,
  right: (v) => `right-${v}`,
  bottom: (v) => `bottom-${v}`,
  left: (v) => `left-${v}`,
  inset: (v) => `inset-${v}`,
  insetX: (v) => `inset-x-${v}`,
  insetY: (v) => `inset-y-${v}`,
  zIndex: (v) => `z-${v}`,

  // Flexbox & Grid
  flexDirection: (v) => {
    const directions: Record<string, string> = {
      row: "flex-row",
      "row-reverse": "flex-row-reverse",
      column: "flex-col",
      "column-reverse": "flex-col-reverse",
    };
    return directions[String(v)] || "";
  },
  flexWrap: (v) => {
    const wraps: Record<string, string> = {
      nowrap: "flex-nowrap",
      wrap: "flex-wrap",
      "wrap-reverse": "flex-wrap-reverse",
    };
    return wraps[String(v)] || "";
  },
  justifyContent: (v) => {
    const justifies: Record<string, string> = {
      "flex-start": "justify-start",
      "flex-end": "justify-end",
      center: "justify-center",
      "space-between": "justify-between",
      "space-around": "justify-around",
      "space-evenly": "justify-evenly",
    };
    return justifies[String(v)] || "";
  },
  alignItems: (v) => {
    const aligns: Record<string, string> = {
      "flex-start": "items-start",
      "flex-end": "items-end",
      center: "items-center",
      baseline: "items-baseline",
      stretch: "items-stretch",
    };
    return aligns[String(v)] || "";
  },
  alignContent: (v) => {
    const aligns: Record<string, string> = {
      "flex-start": "content-start",
      "flex-end": "content-end",
      center: "content-center",
      "space-between": "content-between",
      "space-around": "content-around",
      stretch: "content-stretch",
    };
    return aligns[String(v)] || "";
  },
  alignSelf: (v) => {
    const aligns: Record<string, string> = {
      auto: "self-auto",
      "flex-start": "self-start",
      "flex-end": "self-end",
      center: "self-center",
      baseline: "self-baseline",
      stretch: "self-stretch",
    };
    return aligns[String(v)] || "";
  },
  flex: (v) => `flex-${v}`,
  flexGrow: (v) => `grow${v === 1 ? "" : `-${v}`}`,
  flexShrink: (v) => `shrink${v === 1 ? "" : `-${v}`}`,
  flexBasis: (v) => `basis-${v}`,
  order: (v) => `order-${v}`,
  gap: (v) => `gap-${v}`,
  rowGap: (v) => `gap-y-${v}`,
  columnGap: (v) => `gap-x-${v}`,
  gridTemplate: (_v) => "", // Complex, needs custom handling
  gridTemplateColumns: (v) => `grid-cols-${v}`,
  gridTemplateRows: (v) => `grid-rows-${v}`,
  gridColumn: (v) => `col-${v}`,
  gridRow: (v) => `row-${v}`,

  // Colors (industry standard)
  bg: (v) => `bg-${v}`,
  bgColor: (v) => `bg-${v}`,
  backgroundColor: (v) => `bg-${v}`,
  color: (v) => `text-${v}`,
  opacity: (v) => `opacity-${v}`,

  // Borders
  border: (v) => `border${v === true ? "" : `-${v}`}`,
  borderWidth: (v) => `border-${v}`,
  borderStyle: (v) => `border-${v}`,
  borderColor: (v) => `border-${v}`,
  borderRadius: (v) => `rounded-${v}`,
  borderTop: (v) => `border-t${v === true ? "" : `-${v}`}`,
  borderRight: (v) => `border-r${v === true ? "" : `-${v}`}`,
  borderBottom: (v) => `border-b${v === true ? "" : `-${v}`}`,
  borderLeft: (v) => `border-l${v === true ? "" : `-${v}`}`,
  rounded: (v) => `rounded-${v}`,

  // Typography
  fontSize: (v) => `text-${v}`,
  fontWeight: (v) => `font-${v}`,
  lineHeight: (v) => `leading-${v}`,
  letterSpacing: (v) => `tracking-${v}`,
  textAlign: (v) => `text-${v}`,
  fontFamily: (v) => `font-${v}`,
  fontStyle: (v) => (v === "italic" ? "italic" : "not-italic"),
  textTransform: (v) => String(v),
  textDecoration: (v) => {
    const decorations: Record<string, string> = {
      underline: "underline",
      "line-through": "line-through",
      none: "no-underline",
    };
    return decorations[String(v)] || String(v);
  },

  // Shadow & Effects
  boxShadow: (v) => `shadow-${v}`,
  shadow: (v) => `shadow-${v}`,
  textShadow: (v) => `text-shadow-${v}`, // Needs custom Tailwind plugin
};
