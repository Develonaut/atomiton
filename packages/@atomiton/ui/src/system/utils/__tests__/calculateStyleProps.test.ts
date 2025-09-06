import { describe, it, expect } from "vitest";
import { calculateStyleProps } from "../calculateStyleProps";

describe("calculateStyleProps", () => {
  describe("basic functionality", () => {
    it("should pass through all input props", () => {
      const props = {
        variant: "primary",
        size: "lg",
        customProp: "value",
        onClick: () => {},
      };

      const result = calculateStyleProps(props);

      expect(result).toEqual({
        ...props,
        disabled: undefined, // props.disabled || props.loading where both are undefined
        loading: undefined, // props.loading is undefined
      });
    });

    it("should add disabled and loading properties", () => {
      const props = {
        variant: "primary",
      };

      const result = calculateStyleProps(props);

      expect(result).toEqual({
        variant: "primary",
        disabled: undefined, // undefined || undefined = undefined
        loading: undefined, // undefined
      });
    });
  });

  describe("disabled state calculation", () => {
    it("should set disabled to true when disabled prop is true", () => {
      const props = {
        disabled: true,
        variant: "primary",
      };

      const result = calculateStyleProps(props);

      expect(result.disabled).toBe(true);
      expect(result.loading).toBe(undefined);
    });

    it("should set disabled to true when loading prop is true", () => {
      const props = {
        loading: true,
        variant: "primary",
      };

      const result = calculateStyleProps(props);

      expect(result.disabled).toBe(true);
      expect(result.loading).toBe(true);
    });

    it("should set disabled to true when both disabled and loading are true", () => {
      const props = {
        disabled: true,
        loading: true,
        variant: "primary",
      };

      const result = calculateStyleProps(props);

      expect(result.disabled).toBe(true);
      expect(result.loading).toBe(true);
    });

    it("should set disabled to false when both disabled and loading are false", () => {
      const props = {
        disabled: false,
        loading: false,
        variant: "primary",
      };

      const result = calculateStyleProps(props);

      expect(result.disabled).toBe(false);
      expect(result.loading).toBe(false);
    });

    it("should set disabled to undefined when neither disabled nor loading are provided", () => {
      const props = {
        variant: "primary",
        size: "lg",
      };

      const result = calculateStyleProps(props);

      expect(result.disabled).toBe(undefined);
      expect(result.loading).toBe(undefined);
    });
  });

  describe("loading state handling", () => {
    it("should preserve loading state when provided", () => {
      const props = {
        loading: true,
      };

      const result = calculateStyleProps(props);

      expect(result.loading).toBe(true);
      expect(result.disabled).toBe(true); // Should be true because loading is true
    });

    it("should set loading to undefined when not provided", () => {
      const props = {
        variant: "primary",
      };

      const result = calculateStyleProps(props);

      expect(result.loading).toBe(undefined);
    });

    it("should preserve falsy loading values", () => {
      const props = {
        loading: false,
      };

      const result = calculateStyleProps(props);

      expect(result.loading).toBe(false);
      expect(result.disabled).toBe(false);
    });
  });

  describe("prop preservation", () => {
    it("should preserve all original props without modification", () => {
      const originalCallback = () => {};
      const originalObject = { nested: "value" };

      const props = {
        variant: "secondary",
        size: "sm",
        onClick: originalCallback,
        customConfig: originalObject,
        "data-testid": "test",
        className: "custom-class",
        style: { color: "red" },
        children: "Button text",
        id: "button-id",
        disabled: false,
        loading: false,
      };

      const result = calculateStyleProps(props);

      expect(result.variant).toBe("secondary");
      expect(result.size).toBe("sm");
      expect(result.onClick).toBe(originalCallback);
      expect(result.customConfig).toBe(originalObject);
      expect(result["data-testid"]).toBe("test");
      expect(result.className).toBe("custom-class");
      expect(result.style).toBe(props.style);
      expect(result.children).toBe("Button text");
      expect(result.id).toBe("button-id");
    });

    it("should not modify the original props object", () => {
      const originalProps = {
        variant: "primary",
        size: "lg",
        disabled: true,
      };

      const originalPropsCopy = { ...originalProps };
      calculateStyleProps(originalProps);

      expect(originalProps).toEqual(originalPropsCopy);
    });
  });

  describe("edge cases", () => {
    it("should handle empty props object", () => {
      const props = {};

      const result = calculateStyleProps(props);

      expect(result).toEqual({
        disabled: undefined,
        loading: undefined,
      });
    });

    it("should handle null and undefined values", () => {
      const props = {
        variant: null,
        size: undefined,
        disabled: null,
        loading: undefined,
      };

      const result = calculateStyleProps(props);

      expect(result).toEqual({
        variant: null,
        size: undefined,
        disabled: undefined, // null || undefined = undefined
        loading: undefined, // undefined is undefined
      });
    });

    it("should handle truthy non-boolean values for disabled and loading", () => {
      const props = {
        disabled: "true", // Truthy string
        loading: 1, // Truthy number
      };

      const result = calculateStyleProps(props);

      expect(result.disabled).toBe("true"); // Should use OR logic with loading
      expect(result.loading).toBe(1);
    });

    it("should handle falsy non-boolean values for disabled and loading", () => {
      const props = {
        disabled: "", // Falsy string
        loading: 0, // Falsy number
      };

      const result = calculateStyleProps(props);

      expect(result.disabled).toBe(0); // "" || 0 = 0
      expect(result.loading).toBe(0);
    });
  });

  describe("integration with CVA patterns", () => {
    it("should prepare props suitable for CVA variant functions", () => {
      const props = {
        variant: "primary",
        size: "lg",
        disabled: false,
        loading: true,
        fullWidth: true,
        intent: "destructive",
      };

      const result = calculateStyleProps(props);

      // Should preserve all variant-related props
      expect(result.variant).toBe("primary");
      expect(result.size).toBe("lg");
      expect(result.intent).toBe("destructive");
      expect(result.fullWidth).toBe(true);

      // Should calculate derived states
      expect(result.disabled).toBe(true); // Because loading is true
      expect(result.loading).toBe(true);
    });

    it("should handle component state combinations for styling", () => {
      const testCases = [
        {
          input: { disabled: false, loading: false },
          expected: { disabled: false, loading: false },
          description: "normal state",
        },
        {
          input: { disabled: true, loading: false },
          expected: { disabled: true, loading: false },
          description: "disabled state",
        },
        {
          input: { disabled: false, loading: true },
          expected: { disabled: true, loading: true },
          description: "loading state (implies disabled)",
        },
        {
          input: { disabled: true, loading: true },
          expected: { disabled: true, loading: true },
          description: "both disabled and loading",
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = calculateStyleProps(input);
        expect(result.disabled).toBe(expected.disabled);
        expect(result.loading).toBe(expected.loading);
      });
    });
  });

  describe("performance considerations", () => {
    it("should handle large props objects efficiently", () => {
      const largeProps: Record<string, unknown> = {
        disabled: false,
        loading: true,
      };

      // Add generated properties
      Array.from({ length: 100 }, (_, i) => {
        largeProps[`prop${i}`] = `value${i}`;
      });

      const start = performance.now();
      const result = calculateStyleProps(largeProps);
      const end = performance.now();

      expect(end - start).toBeLessThan(5); // Should be very fast
      expect(Object.keys(result)).toHaveLength(102); // Original props + disabled + loading
      expect(result.disabled).toBe(true); // loading is true
      expect(result.loading).toBe(true);
    });

    it("should be a pure function with no side effects", () => {
      const props = {
        variant: "primary",
        disabled: false,
        loading: false,
      };

      const result1 = calculateStyleProps(props);
      const result2 = calculateStyleProps(props);

      // Should return equivalent objects
      expect(result1).toEqual(result2);

      // Should not be the same reference (new object each time)
      expect(result1).not.toBe(result2);

      // Original props should not be modified
      expect(props).toEqual({
        variant: "primary",
        disabled: false,
        loading: false,
      });
    });
  });

  describe("type safety", () => {
    it("should maintain type information from input props", () => {
      interface TestProps {
        variant: "primary" | "secondary";
        size: "sm" | "md" | "lg";
        disabled?: boolean;
        loading?: boolean;
        customProp: string;
      }

      const props: TestProps = {
        variant: "primary",
        size: "lg",
        disabled: false,
        loading: true,
        customProp: "test-value",
      };

      const result = calculateStyleProps(
        props as unknown as Record<string, unknown>,
      );

      // Should preserve input types and add calculated fields
      expect(result.variant).toBe("primary");
      expect(result.size).toBe("lg");
      expect(result.customProp).toBe("test-value");
      expect(result.disabled).toBe(true); // Calculated
      expect(result.loading).toBe(true); // Preserved
    });

    it("should handle generic type parameters", () => {
      const props = {
        specificProp: "value",
        numericProp: 42,
        booleanProp: true,
        disabled: false,
        loading: false,
      };

      const result = calculateStyleProps(props);

      expect(result.specificProp).toBe("value");
      expect(result.numericProp).toBe(42);
      expect(result.booleanProp).toBe(true);
      expect(result.disabled).toBe(false);
      expect(result.loading).toBe(false);
    });
  });
});
