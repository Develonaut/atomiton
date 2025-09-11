import { describe, it, expect } from "vitest";
import { filterDOMProps } from "../filterDOMProps";

describe("filterDOMProps", () => {
  describe("React component props (isHTMLElement = false)", () => {
    it("should pass through all props for React components", () => {
      const props = {
        variant: "primary",
        size: "lg",
        bg: "blue-500",
        fullWidth: true,
        fullHeight: false,
        onClick: () => {},
        className: "custom-class",
        "data-testid": "test",
        children: "content",
        m: 4,
        p: 2,
        isCustomProp: true,
      };

      const result = filterDOMProps(props, false);

      expect(result).toEqual(props);
      expect(result).toBe(props); // Should be the same reference
    });

    it("should preserve object references for React components", () => {
      const callback = () => {};
      const children = "test content";
      const props = {
        onClick: callback,
        children,
        variant: "primary",
        bg: "red-500",
        fullWidth: true,
      };

      const result = filterDOMProps(props, false);

      expect(result.onClick).toBe(callback);
      expect(result.children).toBe(children);
    });
  });

  describe("HTML element props (isHTMLElement = true)", () => {
    it("should filter out component-specific props", () => {
      const props = {
        variant: "primary",
        size: "lg",
        loading: true,
        asChild: false,
        className: "valid-class",
        id: "valid-id",
        onClick: () => {},
      };

      const result = filterDOMProps(props, true);

      expect(result).toEqual({
        className: "valid-class",
        id: "valid-id",
        onClick: props.onClick,
      });
    });

    it("should filter out legacy Brainwave props", () => {
      const props = {
        isPrimary: true,
        isSecondary: false,
        isOrange: true,
        isSmall: false,
        isLarge: true,
        className: "keep-this",
        title: "keep-this-too",
      };

      const result = filterDOMProps(props, true);

      expect(result).toEqual({
        className: "keep-this",
        title: "keep-this-too",
      });
    });

    it("should filter out state props", () => {
      const props = {
        active: true,
        selected: false,
        checked: true,
        pressed: false,
        expanded: true,
        invalid: false,
        required: true,
        readOnly: false,
        "aria-checked": true, // Should be kept
        "aria-expanded": true, // Should be kept
        role: "button", // Should be kept
      };

      const result = filterDOMProps(props, true);

      expect(result).toEqual({
        "aria-checked": true,
        "aria-expanded": true,
        role: "button",
      });
    });

    it("should filter out system props including layout helpers", () => {
      const props = {
        // Layout helpers - should be filtered
        fullWidth: true,
        fullHeight: false,
        // System props - should be filtered
        bg: "blue-500",
        bgColor: "red-500",
        w: "full",
        h: "screen",
        minW: "0",
        maxW: "prose",
        minH: "fit",
        maxH: "screen",
        boxSize: "10",
        m: 4,
        mx: "auto",
        my: 2,
        p: 3,
        px: 4,
        py: 2,
        // Valid HTML attributes - should be kept
        className: "valid-class",
        id: "valid-id",
        style: { color: "red" },
        "data-testid": "test",
        onClick: () => {},
      };

      const result = filterDOMProps(props, true);

      expect(result).toEqual({
        className: "valid-class",
        id: "valid-id",
        style: props.style,
        "data-testid": "test",
        onClick: props.onClick,
      });
    });

    it("should filter out flexbox and grid system props", () => {
      const props = {
        flexDirection: "column",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center",
        alignSelf: "center",
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: "auto",
        rowGap: 4,
        columnGap: 2,
        gridTemplate: "auto",
        gridTemplateColumns: "3",
        gridTemplateRows: "2",
        gridColumn: "1",
        gridRow: "2",
        // Valid HTML attributes
        className: "flex-container",
        id: "grid-container",
      };

      const result = filterDOMProps(props, true);

      expect(result).toEqual({
        className: "flex-container",
        id: "grid-container",
      });
    });

    it("should filter out typography and border system props", () => {
      const props = {
        rounded: "md",
        boxSizing: "border-box",
        overflowX: "hidden",
        overflowY: "auto",
        textTransform: "uppercase",
        textDecoration: "underline",
        textAlign: "center",
        fontStyle: "italic",
        fontWeight: "bold",
        fontSize: "lg",
        lineHeight: "relaxed",
        letterSpacing: "wide",
        fontFamily: "mono",
        borderWidth: "2",
        borderStyle: "dashed",
        borderColor: "red-500",
        borderRadius: "lg",
        borderTop: "1",
        borderRight: "2",
        borderBottom: "1",
        borderLeft: "2",
        boxShadow: "lg",
        shadow: "md",
        textShadow: "sm",
        // Valid HTML attributes
        className: "typography",
        style: { fontFamily: "Arial" },
      };

      const result = filterDOMProps(props, true);

      expect(result).toEqual({
        className: "typography",
        style: props.style,
      });
    });
  });

  describe("fullWidth and fullHeight filtering", () => {
    it("should filter out fullWidth and fullHeight props for DOM elements", () => {
      const props = {
        fullWidth: true,
        fullHeight: false,
        className: "test",
      };

      const result = filterDOMProps(props, true);

      expect(result).toEqual({
        className: "test",
      });
    });

    it("should filter fullWidth and fullHeight along with other system props", () => {
      const props = {
        fullWidth: true,
        fullHeight: false,
        bg: "blue-500",
        m: 4,
        className: "test",
        id: "component",
      };

      const result = filterDOMProps(props, true);

      expect(result).toEqual({
        className: "test",
        id: "component",
      });
    });
  });

  describe("valid HTML attributes preservation", () => {
    it("should preserve standard HTML attributes", () => {
      const props = {
        // Invalid props to filter
        variant: "primary",
        bg: "blue-500",
        m: 4,
        // Valid HTML attributes to preserve
        className: "valid-class",
        id: "valid-id",
        title: "Valid title",
        "aria-label": "Accessible label",
        "aria-describedby": "description-id",
        "data-testid": "test-component",
        "data-custom": "custom-data",
        role: "button",
        tabIndex: 0,
        onClick: () => {},
        onMouseEnter: () => {},
        style: { color: "red" },
        disabled: true,
        type: "button",
        value: "input-value",
        placeholder: "Enter text",
        name: "input-name",
        autoComplete: "off",
        autoFocus: true,
        required: true, // This is a state prop that gets filtered
        readOnly: false, // This is a state prop that gets filtered
      };

      const result = filterDOMProps(props, true);

      expect(result).toEqual({
        className: "valid-class",
        id: "valid-id",
        title: "Valid title",
        "aria-label": "Accessible label",
        "aria-describedby": "description-id",
        "data-testid": "test-component",
        "data-custom": "custom-data",
        role: "button",
        tabIndex: 0,
        onClick: props.onClick,
        onMouseEnter: props.onMouseEnter,
        style: props.style,
        disabled: true,
        type: "button",
        value: "input-value",
        placeholder: "Enter text",
        name: "input-name",
        autoComplete: "off",
        autoFocus: true,
        // Note: required and readOnly are filtered out as they're in INVALID_DOM_PROPS
      });
    });

    it("should preserve event handlers", () => {
      const handlers = {
        onClick: () => {},
        onMouseEnter: () => {},
        onMouseLeave: () => {},
        onFocus: () => {},
        onBlur: () => {},
        onKeyDown: () => {},
        onKeyUp: () => {},
        onChange: () => {},
        onSubmit: () => {},
      };

      const props = {
        variant: "primary", // Should be filtered
        ...handlers,
        className: "test",
      };

      const result = filterDOMProps(props, true);

      expect(result).toEqual({
        ...handlers,
        className: "test",
      });
    });
  });

  describe("edge cases", () => {
    it("should handle empty props object", () => {
      const props = {};

      const resultComponent = filterDOMProps(props, false);
      const resultDOM = filterDOMProps(props, true);

      expect(resultComponent).toEqual({});
      expect(resultDOM).toEqual({});
    });

    it("should handle props with undefined values", () => {
      const props = {
        variant: undefined,
        bg: "blue-500",
        className: undefined,
        onClick: undefined,
        id: "test",
      };

      const result = filterDOMProps(props, true);

      expect(result).toEqual({
        className: undefined,
        onClick: undefined,
        id: "test",
      });
    });

    it("should handle props with null values", () => {
      const props = {
        variant: null,
        bg: "blue-500",
        className: null,
        onClick: null,
        title: "test",
      };

      const result = filterDOMProps(props, true);

      expect(result).toEqual({
        className: null,
        onClick: null,
        title: "test",
      });
    });

    it("should handle props with falsy values", () => {
      const props = {
        variant: false,
        size: 0,
        bg: "",
        disabled: false,
        className: "",
        id: 0,
        tabIndex: 0,
        "aria-hidden": false,
      };

      const result = filterDOMProps(props, true);

      expect(result).toEqual({
        disabled: false,
        className: "",
        id: 0,
        tabIndex: 0,
        "aria-hidden": false,
      });
    });
  });

  describe("type safety", () => {
    it("should preserve type information for React components", () => {
      type TestProps = {
        variant: "primary" | "secondary";
        customProp: string;
        onClick: () => void;
      };

      const props: TestProps = {
        variant: "primary",
        customProp: "test",
        onClick: () => {},
      };

      const result = filterDOMProps(
        props as unknown as Record<string, unknown>,
        false,
      );

      // Type assertion to verify type safety
      const typedResult = result as unknown as TestProps;
      expect(typedResult.variant).toBe("primary");
      expect(typedResult.customProp).toBe("test");
      expect(typedResult.onClick).toBe(props.onClick);
    });

    it("should maintain correct typing for filtered DOM props", () => {
      const props = {
        variant: "primary", // Will be filtered
        className: "test", // Will be kept
        onClick: () => {}, // Will be kept
        id: "test-id", // Will be kept
      };

      const result = filterDOMProps(props, true);

      expect("className" in result).toBe(true);
      expect("onClick" in result).toBe(true);
      expect("id" in result).toBe(true);
      expect("variant" in result).toBe(false);
    });
  });

  describe("performance considerations", () => {
    it("should handle large props objects efficiently", () => {
      const systemProps = {
        bg: "blue-500",
        color: "white", // This is not filtered because 'color' is a valid CSS property
        m: 1,
        mt: 2,
        mr: 3,
        mb: 4,
        ml: 5,
        mx: 6,
        my: 7,
        p: 1,
        pt: 2,
        pr: 3,
        pb: 4,
        pl: 5,
        px: 6,
        py: 7,
        w: "full",
        h: "screen",
        minW: "0",
        maxW: "prose",
        display: "flex",
        position: "relative",
        top: "0", // These are valid HTML attributes
        flexDirection: "column",
        justifyContent: "center",
        fontSize: "lg",
        fontWeight: "bold",
        lineHeight: "relaxed",
      };

      const validProps: Record<string, unknown> = {};
      Array.from({ length: 50 }, (_, i) => {
        validProps[`valid-prop-${i}`] = `value-${i}`;
      });

      const props = { ...systemProps, ...validProps };

      const start = performance.now();
      const result = filterDOMProps(props, true);
      const end = performance.now();

      expect(end - start).toBeLessThan(5); // Should be very fast
      // Some system props like 'color', 'display', 'position', 'top' are valid HTML attributes and pass through
      expect(Object.keys(result)).toHaveLength(54); // Should have 50 valid props + 4 HTML-valid system props

      // Verify that most system props were filtered but HTML-valid ones passed through
      expect(result.color).toBe("white"); // Valid HTML attribute
      expect(result.display).toBe("flex"); // Valid HTML attribute
      expect(result.position).toBe("relative"); // Valid HTML attribute
      expect(result.top).toBe("0"); // Valid HTML attribute

      // These system props should be filtered out
      expect(result.bg).toBeUndefined();
      expect(result.m).toBeUndefined();
      expect(result.flexDirection).toBeUndefined();
    });

    it("should not modify the original props object", () => {
      const originalProps = {
        variant: "primary",
        bg: "blue-500",
        className: "test",
        onClick: () => {},
      };

      const propsCopy = { ...originalProps };
      filterDOMProps(originalProps, true);

      expect(originalProps).toEqual(propsCopy);
    });
  });
});
