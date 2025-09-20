import { describe, it, expect } from "vitest";
import { systemPropsMap } from "./systemPropsMap";

describe("systemPropsMap", () => {
  describe("fullWidth and fullHeight props", () => {
    it("should convert fullWidth boolean true to w-full class", () => {
      const resolver = systemPropsMap.fullWidth;
      expect(resolver(true)).toBe("w-full");
    });

    it("should convert fullWidth string 'true' to w-full class", () => {
      const resolver = systemPropsMap.fullWidth;
      expect(resolver("true")).toBe("w-full");
    });

    it("should convert fullWidth boolean false to empty string", () => {
      const resolver = systemPropsMap.fullWidth;
      expect(resolver(false)).toBe("");
    });

    it("should convert fullWidth string 'false' to empty string", () => {
      const resolver = systemPropsMap.fullWidth;
      expect(resolver("false")).toBe("");
    });

    it("should convert fullWidth undefined to empty string", () => {
      const resolver = systemPropsMap.fullWidth;
      expect(resolver(undefined as unknown as string | number | boolean)).toBe(
        "",
      );
    });

    it("should convert fullHeight boolean true to h-full class", () => {
      const resolver = systemPropsMap.fullHeight;
      expect(resolver(true)).toBe("h-full");
    });

    it("should convert fullHeight string 'true' to h-full class", () => {
      const resolver = systemPropsMap.fullHeight;
      expect(resolver("true")).toBe("h-full");
    });

    it("should convert fullHeight boolean false to empty string", () => {
      const resolver = systemPropsMap.fullHeight;
      expect(resolver(false)).toBe("");
    });

    it("should convert fullHeight string 'false' to empty string", () => {
      const resolver = systemPropsMap.fullHeight;
      expect(resolver("false")).toBe("");
    });

    it("should convert fullHeight undefined to empty string", () => {
      const resolver = systemPropsMap.fullHeight;
      expect(resolver(undefined as unknown as string | number | boolean)).toBe(
        "",
      );
    });
  });

  describe("margin props", () => {
    const marginProps = [
      "m",
      "mt",
      "mr",
      "mb",
      "ml",
      "mx",
      "my",
      "ms",
      "me",
    ] as const;

    it.each(marginProps)("should handle %s prop correctly", (prop) => {
      const resolver = systemPropsMap[prop];
      expect(resolver("4")).toBe(`${prop}-4`);
      expect(resolver("auto")).toBe(`${prop}-auto`);
      expect(resolver(0)).toBe(`${prop}-0`);
    });
  });

  describe("padding props", () => {
    const paddingProps = [
      "p",
      "pt",
      "pr",
      "pb",
      "pl",
      "px",
      "py",
      "ps",
      "pe",
    ] as const;

    it.each(paddingProps)("should handle %s prop correctly", (prop) => {
      const resolver = systemPropsMap[prop];
      expect(resolver("4")).toBe(`${prop}-4`);
      expect(resolver("8")).toBe(`${prop}-8`);
      expect(resolver(0)).toBe(`${prop}-0`);
    });
  });

  describe("width and height props", () => {
    it("should handle width variants", () => {
      expect(systemPropsMap.w("full")).toBe("w-full");
      expect(systemPropsMap.width("1/2")).toBe("w-1/2");
      expect(systemPropsMap.minW("0")).toBe("min-w-0");
      expect(systemPropsMap.minWidth("fit")).toBe("min-w-fit");
      expect(systemPropsMap.maxW("prose")).toBe("max-w-prose");
      expect(systemPropsMap.maxWidth("screen")).toBe("max-w-screen");
    });

    it("should handle height variants", () => {
      expect(systemPropsMap.h("full")).toBe("h-full");
      expect(systemPropsMap.height("screen")).toBe("h-screen");
      expect(systemPropsMap.minH("0")).toBe("min-h-0");
      expect(systemPropsMap.minHeight("full")).toBe("min-h-full");
      expect(systemPropsMap.maxH("screen")).toBe("max-h-screen");
      expect(systemPropsMap.maxHeight("fit")).toBe("max-h-fit");
    });

    it("should handle boxSize props", () => {
      expect(systemPropsMap.boxSize("10")).toBe("size-10");
      expect(systemPropsMap.boxSize("full")).toBe("size-full");
    });
  });

  describe("display prop", () => {
    it("should handle valid display values", () => {
      expect(systemPropsMap.display("none")).toBe("hidden");
      expect(systemPropsMap.display("block")).toBe("block");
      expect(systemPropsMap.display("inline")).toBe("inline");
      expect(systemPropsMap.display("inline-block")).toBe("inline-block");
      expect(systemPropsMap.display("flex")).toBe("flex");
      expect(systemPropsMap.display("inline-flex")).toBe("inline-flex");
      expect(systemPropsMap.display("grid")).toBe("grid");
      expect(systemPropsMap.display("inline-grid")).toBe("inline-grid");
      expect(systemPropsMap.display("table")).toBe("table");
    });

    it("should return empty string for invalid display values", () => {
      expect(
        systemPropsMap.display("invalid" as string | number | boolean),
      ).toBe("");
    });
  });

  describe("position prop", () => {
    it("should handle valid position values", () => {
      expect(systemPropsMap.position("static")).toBe("static");
      expect(systemPropsMap.position("relative")).toBe("relative");
      expect(systemPropsMap.position("absolute")).toBe("absolute");
      expect(systemPropsMap.position("fixed")).toBe("fixed");
      expect(systemPropsMap.position("sticky")).toBe("sticky");
    });

    it("should return empty string for invalid position values", () => {
      expect(
        systemPropsMap.position("invalid" as string | number | boolean),
      ).toBe("");
    });

    it("should handle position offset props", () => {
      expect(systemPropsMap.top("0")).toBe("top-0");
      expect(systemPropsMap.right("4")).toBe("right-4");
      expect(systemPropsMap.bottom("auto")).toBe("bottom-auto");
      expect(systemPropsMap.left("1/2")).toBe("left-1/2");
      expect(systemPropsMap.inset("0")).toBe("inset-0");
      expect(systemPropsMap.insetX("4")).toBe("inset-x-4");
      expect(systemPropsMap.insetY("2")).toBe("inset-y-2");
      expect(systemPropsMap.zIndex("10")).toBe("z-10");
    });
  });

  describe("flexbox props", () => {
    it("should handle flexDirection values", () => {
      expect(systemPropsMap.flexDirection("row")).toBe("flex-row");
      expect(systemPropsMap.flexDirection("row-reverse")).toBe(
        "flex-row-reverse",
      );
      expect(systemPropsMap.flexDirection("column")).toBe("flex-col");
      expect(systemPropsMap.flexDirection("column-reverse")).toBe(
        "flex-col-reverse",
      );
      expect(
        systemPropsMap.flexDirection("invalid" as string | number | boolean),
      ).toBe("");
    });

    it("should handle flexWrap values", () => {
      expect(systemPropsMap.flexWrap("nowrap")).toBe("flex-nowrap");
      expect(systemPropsMap.flexWrap("wrap")).toBe("flex-wrap");
      expect(systemPropsMap.flexWrap("wrap-reverse")).toBe("flex-wrap-reverse");
      expect(
        systemPropsMap.flexWrap("invalid" as string | number | boolean),
      ).toBe("");
    });

    it("should handle justifyContent values", () => {
      expect(systemPropsMap.justifyContent("flex-start")).toBe("justify-start");
      expect(systemPropsMap.justifyContent("flex-end")).toBe("justify-end");
      expect(systemPropsMap.justifyContent("center")).toBe("justify-center");
      expect(systemPropsMap.justifyContent("space-between")).toBe(
        "justify-between",
      );
      expect(systemPropsMap.justifyContent("space-around")).toBe(
        "justify-around",
      );
      expect(systemPropsMap.justifyContent("space-evenly")).toBe(
        "justify-evenly",
      );
      expect(
        systemPropsMap.justifyContent("invalid" as string | number | boolean),
      ).toBe("");
    });

    it("should handle alignItems values", () => {
      expect(systemPropsMap.alignItems("flex-start")).toBe("items-start");
      expect(systemPropsMap.alignItems("flex-end")).toBe("items-end");
      expect(systemPropsMap.alignItems("center")).toBe("items-center");
      expect(systemPropsMap.alignItems("baseline")).toBe("items-baseline");
      expect(systemPropsMap.alignItems("stretch")).toBe("items-stretch");
      expect(
        systemPropsMap.alignItems("invalid" as string | number | boolean),
      ).toBe("");
    });

    it("should handle flex grow/shrink/basis", () => {
      expect(systemPropsMap.flexGrow(1)).toBe("grow");
      expect(systemPropsMap.flexGrow(0)).toBe("grow-0");
      expect(systemPropsMap.flexGrow(2)).toBe("grow-2");

      expect(systemPropsMap.flexShrink(1)).toBe("shrink");
      expect(systemPropsMap.flexShrink(0)).toBe("shrink-0");
      expect(systemPropsMap.flexShrink(2)).toBe("shrink-2");

      expect(systemPropsMap.flexBasis("auto")).toBe("basis-auto");
      expect(systemPropsMap.flexBasis("1/2")).toBe("basis-1/2");
    });

    it("should handle gap properties", () => {
      expect(systemPropsMap.gap("4")).toBe("gap-4");
      expect(systemPropsMap.rowGap("2")).toBe("gap-y-2");
      expect(systemPropsMap.columnGap("6")).toBe("gap-x-6");
    });
  });

  describe("color props", () => {
    it("should handle background colors", () => {
      expect(systemPropsMap.bg("red-500")).toBe("bg-red-500");
      expect(systemPropsMap.bgColor("blue-100")).toBe("bg-blue-100");
      expect(systemPropsMap.backgroundColor("transparent")).toBe(
        "bg-transparent",
      );
    });

    it("should handle text colors", () => {
      expect(systemPropsMap.color("gray-800")).toBe("text-gray-800");
    });

    it("should handle opacity", () => {
      expect(systemPropsMap.opacity("50")).toBe("opacity-50");
      expect(systemPropsMap.opacity(0.5)).toBe("opacity-0.5");
    });
  });

  describe("border props", () => {
    it("should handle border width", () => {
      expect(systemPropsMap.border(true)).toBe("border");
      expect(systemPropsMap.border("2")).toBe("border-2");
      expect(systemPropsMap.borderWidth("4")).toBe("border-4");
    });

    it("should handle border sides", () => {
      expect(systemPropsMap.borderTop(true)).toBe("border-t");
      expect(systemPropsMap.borderTop("2")).toBe("border-t-2");
      expect(systemPropsMap.borderRight(true)).toBe("border-r");
      expect(systemPropsMap.borderBottom("4")).toBe("border-b-4");
      expect(systemPropsMap.borderLeft(true)).toBe("border-l");
    });

    it("should handle border radius", () => {
      expect(systemPropsMap.borderRadius("md")).toBe("rounded-md");
      expect(systemPropsMap.rounded("full")).toBe("rounded-full");
    });

    it("should handle border style and color", () => {
      expect(systemPropsMap.borderStyle("dashed")).toBe("border-dashed");
      expect(systemPropsMap.borderColor("red-500")).toBe("border-red-500");
    });
  });

  describe("typography props", () => {
    it("should handle font properties", () => {
      expect(systemPropsMap.fontSize("lg")).toBe("text-lg");
      expect(systemPropsMap.fontWeight("bold")).toBe("font-bold");
      expect(systemPropsMap.fontFamily("mono")).toBe("font-mono");
      expect(systemPropsMap.lineHeight("loose")).toBe("leading-loose");
      expect(systemPropsMap.letterSpacing("wide")).toBe("tracking-wide");
      expect(systemPropsMap.textAlign("center")).toBe("text-center");
    });

    it("should handle font style", () => {
      expect(systemPropsMap.fontStyle("italic")).toBe("italic");
      expect(systemPropsMap.fontStyle("normal")).toBe("not-italic");
    });

    it("should handle text transform", () => {
      expect(systemPropsMap.textTransform("uppercase")).toBe("uppercase");
      expect(systemPropsMap.textTransform("lowercase")).toBe("lowercase");
    });

    it("should handle text decoration", () => {
      expect(systemPropsMap.textDecoration("underline")).toBe("underline");
      expect(systemPropsMap.textDecoration("line-through")).toBe(
        "line-through",
      );
      expect(systemPropsMap.textDecoration("none")).toBe("no-underline");
      expect(systemPropsMap.textDecoration("custom")).toBe("custom");
    });
  });

  describe("shadow props", () => {
    it("should handle box shadow", () => {
      expect(systemPropsMap.boxShadow("lg")).toBe("shadow-lg");
      expect(systemPropsMap.shadow("md")).toBe("shadow-md");
    });

    it("should handle text shadow", () => {
      expect(systemPropsMap.textShadow("sm")).toBe("text-shadow-sm");
    });
  });

  describe("overflow props", () => {
    it("should handle overflow properties", () => {
      expect(systemPropsMap.overflow("hidden")).toBe("overflow-hidden");
      expect(systemPropsMap.overflowX("auto")).toBe("overflow-x-auto");
      expect(systemPropsMap.overflowY("scroll")).toBe("overflow-y-scroll");
    });

    it("should handle box sizing", () => {
      expect(systemPropsMap.boxSizing("border-box")).toBe("box-border");
      expect(systemPropsMap.boxSizing("content-box")).toBe("box-content");
    });
  });

  describe("grid props", () => {
    it("should handle grid template properties", () => {
      expect(systemPropsMap.gridTemplate("custom")).toBe("");
      expect(systemPropsMap.gridTemplateColumns("3")).toBe("grid-cols-3");
      expect(systemPropsMap.gridTemplateRows("4")).toBe("grid-rows-4");
      expect(systemPropsMap.gridColumn("span-2")).toBe("col-span-2");
      expect(systemPropsMap.gridRow("start-2")).toBe("row-start-2");
    });
  });

  describe("type safety", () => {
    it("should have all SystemProps keys in systemPropsMap", () => {
      const systemPropsKeys = [
        // Layout helpers - new props
        "fullWidth",
        "fullHeight",
        // Margin
        "m",
        "mt",
        "mr",
        "mb",
        "ml",
        "mx",
        "my",
        "ms",
        "me",
        // Padding
        "p",
        "pt",
        "pr",
        "pb",
        "pl",
        "px",
        "py",
        "ps",
        "pe",
        // Width/Height
        "w",
        "width",
        "h",
        "height",
        "minW",
        "minWidth",
        "maxW",
        "maxWidth",
        "minH",
        "minHeight",
        "maxH",
        "maxHeight",
        "boxSize",
        // Display & Box Model
        "display",
        "overflow",
        "overflowX",
        "overflowY",
        "boxSizing",
        // Position
        "position",
        "top",
        "right",
        "bottom",
        "left",
        "inset",
        "insetX",
        "insetY",
        "zIndex",
        // Flexbox & Grid
        "flexDirection",
        "flexWrap",
        "justifyContent",
        "alignItems",
        "alignContent",
        "alignSelf",
        "flex",
        "flexGrow",
        "flexShrink",
        "flexBasis",
        "order",
        "gap",
        "rowGap",
        "columnGap",
        "gridTemplate",
        "gridTemplateColumns",
        "gridTemplateRows",
        "gridColumn",
        "gridRow",
        // Colors
        "bg",
        "bgColor",
        "backgroundColor",
        "color",
        "opacity",
        // Borders
        "border",
        "borderWidth",
        "borderStyle",
        "borderColor",
        "borderRadius",
        "borderTop",
        "borderRight",
        "borderBottom",
        "borderLeft",
        "rounded",
        // Typography
        "fontSize",
        "fontWeight",
        "lineHeight",
        "letterSpacing",
        "textAlign",
        "fontFamily",
        "fontStyle",
        "textTransform",
        "textDecoration",
        // Shadow & Effects
        "boxShadow",
        "shadow",
        "textShadow",
      ] as const;

      systemPropsKeys.forEach((key) => {
        expect(systemPropsMap).toHaveProperty(key);
        expect(typeof systemPropsMap[key]).toBe("function");
      });
    });

    it("should handle numeric values", () => {
      expect(systemPropsMap.m(4)).toBe("m-4");
      expect(systemPropsMap.p(0)).toBe("p-0");
      expect(systemPropsMap.w(10)).toBe("w-10");
      expect(systemPropsMap.opacity(50)).toBe("opacity-50");
    });

    it("should handle string values", () => {
      expect(systemPropsMap.bg("red-500")).toBe("bg-red-500");
      expect(systemPropsMap.fontSize("xl")).toBe("text-xl");
      expect(systemPropsMap.border("2")).toBe("border-2");
    });

    it("should handle boolean values for appropriate props", () => {
      expect(systemPropsMap.fullWidth(true)).toBe("w-full");
      expect(systemPropsMap.fullHeight(false)).toBe("");
      expect(systemPropsMap.border(true)).toBe("border");
    });
  });

  describe("edge cases", () => {
    it("should handle empty string values", () => {
      expect(systemPropsMap.m("")).toBe("m-");
      expect(systemPropsMap.bg("")).toBe("bg-");
    });

    it("should handle zero values correctly", () => {
      expect(systemPropsMap.m(0)).toBe("m-0");
      expect(systemPropsMap.p(0)).toBe("p-0");
      expect(systemPropsMap.opacity(0)).toBe("opacity-0");
    });

    it("should handle special Tailwind values", () => {
      expect(systemPropsMap.w("1/2")).toBe("w-1/2");
      expect(systemPropsMap.h("screen")).toBe("h-screen");
      expect(systemPropsMap.maxW("prose")).toBe("max-w-prose");
      expect(systemPropsMap.inset("auto")).toBe("inset-auto");
    });
  });
});
