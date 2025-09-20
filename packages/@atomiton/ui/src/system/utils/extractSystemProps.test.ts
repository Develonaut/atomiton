import { describe, it, expect } from "vitest";
import { extractSystemProps } from "./extractSystemProps";

describe("extractSystemProps", () => {
  describe("fullWidth and fullHeight props", () => {
    it("should extract fullWidth boolean true and convert to w-full class", () => {
      const props = {
        fullWidth: true,
        children: "test",
        onClick: () => {},
      };

      const result = extractSystemProps(props);

      expect(result.systemClasses).toEqual(["w-full"]);
      expect(result.restProps).toEqual({
        children: "test",
        onClick: props.onClick,
      });
    });

    it("should extract fullHeight boolean true and convert to h-full class", () => {
      const props = {
        fullHeight: true,
        className: "custom-class",
        "data-testid": "test",
      };

      const result = extractSystemProps(props);

      expect(result.systemClasses).toEqual(["h-full"]);
      expect(result.restProps).toEqual({
        className: "custom-class",
        "data-testid": "test",
      });
    });

    it("should extract both fullWidth and fullHeight when both are true", () => {
      const props = {
        fullWidth: true,
        fullHeight: true,
        title: "test title",
      };

      const result = extractSystemProps(props);

      expect(result.systemClasses).toEqual(["w-full", "h-full"]);
      expect(result.restProps).toEqual({
        title: "test title",
      });
    });

    it("should not include classes for fullWidth/fullHeight when false", () => {
      const props = {
        fullWidth: false,
        fullHeight: false,
        id: "test-id",
      };

      const result = extractSystemProps(props);

      expect(result.systemClasses).toEqual([]);
      expect(result.restProps).toEqual({
        id: "test-id",
      });
    });

    it("should handle string 'true' values for fullWidth/fullHeight", () => {
      const props = {
        fullWidth: "true",
        fullHeight: "true",
        role: "button",
      };

      const result = extractSystemProps(props);

      expect(result.systemClasses).toEqual(["w-full", "h-full"]);
      expect(result.restProps).toEqual({
        role: "button",
      });
    });
  });

  describe("basic system props extraction", () => {
    it("should extract margin props and convert to classes", () => {
      const props = {
        m: 4,
        mt: 2,
        mx: "auto",
        children: "test",
      };

      const result = extractSystemProps(props);

      expect(result.systemClasses).toEqual(["m-4", "mt-2", "mx-auto"]);
      expect(result.restProps).toEqual({
        children: "test",
      });
    });

    it("should extract padding props and convert to classes", () => {
      const props = {
        p: 3,
        px: 6,
        py: 2,
        onClick: () => {},
      };

      const result = extractSystemProps(props);

      expect(result.systemClasses).toEqual(["p-3", "px-6", "py-2"]);
      expect(result.restProps).toEqual({
        onClick: props.onClick,
      });
    });

    it("should extract width and height props", () => {
      const props = {
        w: "full",
        h: "screen",
        minW: "0",
        maxH: "fit",
        className: "existing-class",
      };

      const result = extractSystemProps(props);

      expect(result.systemClasses).toEqual([
        "w-full",
        "h-screen",
        "min-w-0",
        "max-h-fit",
      ]);
      expect(result.restProps).toEqual({
        className: "existing-class",
      });
    });
  });

  describe("complex system props", () => {
    it("should extract display and position props", () => {
      const props = {
        display: "flex",
        position: "absolute",
        top: 0,
        left: "1/2",
        zIndex: 10,
        id: "positioned-element",
      };

      const result = extractSystemProps(props);

      expect(result.systemClasses).toEqual([
        "flex",
        "absolute",
        "top-0",
        "left-1/2",
        "z-10",
      ]);
      expect(result.restProps).toEqual({
        id: "positioned-element",
      });
    });

    it("should extract flexbox props", () => {
      const props = {
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 4,
        flex: 1,
        "aria-label": "flex container",
      };

      const result = extractSystemProps(props);

      expect(result.systemClasses).toEqual([
        "flex-col",
        "justify-between",
        "items-center",
        "gap-4",
        "flex-1",
      ]);
      expect(result.restProps).toEqual({
        "aria-label": "flex container",
      });
    });

    it("should extract color and border props", () => {
      const props = {
        bg: "blue-500",
        color: "white",
        border: true,
        borderRadius: "md",
        opacity: 90,
        style: { transform: "scale(1.1)" },
      };

      const result = extractSystemProps(props);

      expect(result.systemClasses).toEqual([
        "bg-blue-500",
        "text-white",
        "border",
        "rounded-md",
        "opacity-90",
      ]);
      expect(result.restProps).toEqual({
        style: props.style,
      });
    });
  });

  describe("edge cases and error handling", () => {
    it("should handle empty props object", () => {
      const props = {};

      const result = extractSystemProps(props);

      expect(result.systemClasses).toEqual([]);
      expect(result.restProps).toEqual({});
    });

    it("should skip undefined values", () => {
      const props = {
        m: undefined,
        p: 4,
        bg: undefined,
        color: "red-500",
        children: "test",
        onClick: undefined,
      };

      const result = extractSystemProps(props);

      expect(result.systemClasses).toEqual(["p-4", "text-red-500"]);
      expect(result.restProps).toEqual({
        children: "test",
      });
    });

    it("should handle null values", () => {
      const props = {
        m: null,
        p: 4,
        children: null,
        title: "test",
      };

      const result = extractSystemProps(props as Record<string, unknown>);

      expect(result.systemClasses).toEqual(["m-null", "p-4"]);
      expect(result.restProps).toEqual({
        children: null,
        title: "test",
      });
    });

    it("should handle system props that resolve to empty strings", () => {
      const props = {
        display: "invalid-display",
        position: "invalid-position",
        fullWidth: false,
        m: 4,
        id: "test",
      };

      const result = extractSystemProps(props as Record<string, unknown>);

      expect(result.systemClasses).toEqual(["m-4"]);
      expect(result.restProps).toEqual({
        id: "test",
      });
    });

    it("should handle numeric zero values", () => {
      const props = {
        m: 0,
        p: 0,
        opacity: 0,
        zIndex: 0,
        children: "test",
      };

      const result = extractSystemProps(props);

      expect(result.systemClasses).toEqual(["m-0", "p-0", "opacity-0", "z-0"]);
      expect(result.restProps).toEqual({
        children: "test",
      });
    });
  });

  describe("mixed props scenarios", () => {
    it("should handle mix of system and non-system props", () => {
      const props = {
        // System props
        m: 4,
        p: 2,
        bg: "gray-100",
        fullWidth: true,
        display: "flex",
        // Non-system props
        className: "custom-class",
        onClick: () => {},
        children: "child content",
        "data-testid": "test-component",
        style: { transform: "rotate(45deg)" },
        id: "unique-id",
        role: "button",
        tabIndex: 0,
        "aria-label": "Test button",
      };

      const result = extractSystemProps(props);

      expect(result.systemClasses).toEqual([
        "m-4",
        "p-2",
        "bg-gray-100",
        "w-full",
        "flex",
      ]);
      expect(result.restProps).toEqual({
        className: "custom-class",
        onClick: props.onClick,
        children: "child content",
        "data-testid": "test-component",
        style: props.style,
        id: "unique-id",
        role: "button",
        tabIndex: 0,
        "aria-label": "Test button",
      });
    });

    it("should preserve complex object values in restProps", () => {
      const complexObject = { nested: { value: true }, array: [1, 2, 3] };
      const props = {
        m: 4,
        customConfig: complexObject,
        onCustomEvent: (data: unknown) => data,
        ref: { current: null },
      };

      const result = extractSystemProps(props);

      expect(result.systemClasses).toEqual(["m-4"]);
      expect(result.restProps).toEqual({
        customConfig: complexObject,
        onCustomEvent: props.onCustomEvent,
        ref: props.ref,
      });
      expect(result.restProps.customConfig).toBe(complexObject);
    });

    it("should handle all new layout helper props together", () => {
      const props = {
        fullWidth: true,
        fullHeight: "true",
        w: "1/2", // Should be overridden by fullWidth
        h: "auto", // Should be overridden by fullHeight
        className: "base-class",
        id: "layout-component",
      };

      const result = extractSystemProps(props);

      expect(result.systemClasses).toEqual([
        "w-full",
        "h-full",
        "w-1/2",
        "h-auto",
      ]);
      expect(result.restProps).toEqual({
        className: "base-class",
        id: "layout-component",
      });
    });
  });

  describe("type safety", () => {
    it("should maintain type safety for restProps", () => {
      type TestProps = {
        m?: number;
        fullWidth?: boolean;
        customProp: string;
        onClick: () => void;
        [key: string]: unknown; // Add index signature
      };

      const props: TestProps = {
        m: 4,
        fullWidth: true,
        customProp: "test",
        onClick: () => {},
      };

      const result = extractSystemProps(props);

      expect(result.systemClasses).toEqual(["m-4", "w-full"]);

      // Type assertion to verify type safety
      const restProps = result.restProps as Omit<TestProps, "m" | "fullWidth">;
      expect(restProps.customProp).toBe("test");
      expect(restProps.onClick).toBe(props.onClick);
    });

    it("should handle generic type parameters correctly", () => {
      const props = {
        p: 2,
        fullHeight: true,
        specificProp: "value",
        numericProp: 42,
        booleanProp: true,
      };

      const result = extractSystemProps(props);

      expect(result.systemClasses).toEqual(["p-2", "h-full"]);
      expect(result.restProps).toEqual({
        specificProp: "value",
        numericProp: 42,
        booleanProp: true,
      });
    });
  });

  describe("performance considerations", () => {
    it("should handle large props objects efficiently", () => {
      const props: Record<string, unknown> = {
        // System props
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
        fullWidth: true,
        fullHeight: false,
        bg: "red-500",
        color: "white",
        opacity: 90,
      };

      // Add munknown non-system props
      Array.from({ length: 50 }, (_, i) => {
        props[`nonSystem${i}`] = `value${i}`;
      });

      const start = performance.now();
      const result = extractSystemProps(props);
      const end = performance.now();

      expect(end - start).toBeLessThan(10); // Should be very fast
      expect(result.systemClasses).toHaveLength(20); // Should extract all system props
      expect(Object.keys(result.restProps)).toHaveLength(50); // Should preserve all non-system props
    });
  });
});
