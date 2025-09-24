import { generateDataAttributes } from "#generateDataAttributes";
import { describe, expect, it } from "vitest";

describe("generateDataAttributes", () => {
  describe("basic data attribute generation", () => {
    it("should generate data-variant attribute", () => {
      const props = { variant: "primary" };
      const result = generateDataAttributes(props);

      expect(result).toEqual({ "data-variant": "primary" });
    });

    it("should generate data-size attribute", () => {
      const props = { size: "lg" };
      const result = generateDataAttributes(props);

      expect(result).toEqual({ "data-size": "lg" });
    });

    it("should generate data-loading attribute for loading state", () => {
      const props = { loading: true };
      const result = generateDataAttributes(props);

      expect(result).toEqual({
        "data-loading": true,
        "data-disabled": true, // loading implies disabled
      });
    });

    it("should generate data-disabled attribute for disabled state", () => {
      const props = { disabled: true };
      const result = generateDataAttributes(props);

      expect(result).toEqual({ "data-disabled": true });
    });

    it("should generate data-disabled when loading is true", () => {
      const props = { loading: true };
      const result = generateDataAttributes(props);

      expect(result).toEqual({
        "data-loading": true,
        "data-disabled": true,
      });
    });
  });

  describe("state data attributes", () => {
    it("should generate data-active attribute", () => {
      const props = { active: true };
      const result = generateDataAttributes(props);

      expect(result).toEqual({ "data-active": true });
    });

    it("should generate data-selected attribute", () => {
      const props = { selected: true };
      const result = generateDataAttributes(props);

      expect(result).toEqual({ "data-selected": true });
    });

    it("should generate data-checked attribute", () => {
      const props = { checked: true };
      const result = generateDataAttributes(props);

      expect(result).toEqual({ "data-checked": true });
    });

    it("should generate data-expanded attribute", () => {
      const props = { expanded: true };
      const result = generateDataAttributes(props);

      expect(result).toEqual({ "data-expanded": true });
    });

    it("should generate data-pressed attribute", () => {
      const props = { pressed: true };
      const result = generateDataAttributes(props);

      expect(result).toEqual({ "data-pressed": true });
    });

    it("should generate data-invalid attribute", () => {
      const props = { invalid: true };
      const result = generateDataAttributes(props);

      expect(result).toEqual({ "data-invalid": true });
    });

    it("should generate data-required attribute", () => {
      const props = { required: true };
      const result = generateDataAttributes(props);

      expect(result).toEqual({ "data-required": true });
    });

    it("should generate data-readonly attribute", () => {
      const props = { readOnly: true };
      const result = generateDataAttributes(props);

      expect(result).toEqual({ "data-readonly": true });
    });
  });

  describe("comprehensive attribute combinations", () => {
    it("should generate all relevant data attributes for complex component state", () => {
      const props = {
        variant: "primary",
        size: "lg",
        loading: false,
        disabled: true,
        active: true,
        selected: false,
        checked: true,
        expanded: false,
        pressed: true,
        invalid: false,
        required: true,
        readOnly: false,
        // Non-relevant props that should be ignored
        onClick: () => {},
        className: "test-class",
        children: "Button text",
        style: { color: "red" },
      };

      const result = generateDataAttributes(props);

      expect(result).toEqual({
        "data-variant": "primary",
        "data-size": "lg",
        "data-disabled": true,
        "data-active": true,
        "data-checked": true,
        "data-pressed": true,
        "data-required": true,
      });
    });

    it("should handle loading and disabled combination correctly", () => {
      const testCases = [
        {
          props: { loading: false, disabled: false },
          expected: {},
          description: "neither loading nor disabled",
        },
        {
          props: { loading: true, disabled: false },
          expected: { "data-loading": true, "data-disabled": true },
          description: "loading true, disabled false",
        },
        {
          props: { loading: false, disabled: true },
          expected: { "data-disabled": true },
          description: "loading false, disabled true",
        },
        {
          props: { loading: true, disabled: true },
          expected: { "data-loading": true, "data-disabled": true },
          description: "both loading and disabled true",
        },
      ];

      testCases.forEach(({ props, expected }) => {
        const result = generateDataAttributes(props);
        expect(result).toEqual(expected);
      });
    });
  });

  describe("edge cases and falsy values", () => {
    it("should handle empty props object", () => {
      const props = {};
      const result = generateDataAttributes(props);

      expect(result).toEqual({});
    });

    it("should ignore falsy values for boolean state props", () => {
      const props = {
        variant: "primary", // Should be included
        size: "lg", // Should be included
        loading: false, // Should be ignored
        disabled: false, // Should be ignored
        active: false, // Should be ignored
        selected: false, // Should be ignored
        checked: false, // Should be ignored
        expanded: false, // Should be ignored
        pressed: false, // Should be ignored
        invalid: false, // Should be ignored
        required: false, // Should be ignored
        readOnly: false, // Should be ignored
      };

      const result = generateDataAttributes(props);

      expect(result).toEqual({
        "data-variant": "primary",
        "data-size": "lg",
      });
    });

    it("should handle null and undefined values", () => {
      const props = {
        variant: null,
        size: undefined,
        loading: null,
        disabled: undefined,
        active: null,
        selected: undefined,
      };

      const result = generateDataAttributes(props);

      expect(result).toEqual({});
    });

    it("should handle truthy non-boolean values", () => {
      const props = {
        variant: "primary",
        size: "lg",
        loading: "true", // Truthy string
        disabled: 1, // Truthy number
        active: "yes", // Truthy string
        selected: [], // Truthy array (empty but truthy)
        checked: {}, // Truthy object (empty but truthy)
      };

      const result = generateDataAttributes(props);

      expect(result).toEqual({
        "data-variant": "primary",
        "data-size": "lg",
        "data-loading": true,
        "data-disabled": true, // 1 || "true" = "true" (truthy)
        "data-active": true,
        "data-selected": true,
        "data-checked": true,
      });
    });

    it("should handle falsy non-boolean values", () => {
      const props = {
        variant: "", // Falsy string
        size: 0, // Falsy number
        loading: "", // Falsy string
        disabled: 0, // Falsy number
        active: "", // Falsy string
        selected: null, // Falsy
        checked: undefined, // Falsy
      };

      const result = generateDataAttributes(props);

      expect(result).toEqual({});
    });
  });

  describe("data attribute value handling", () => {
    it("should preserve string values for variant and size", () => {
      const props = {
        variant: "secondary",
        size: "sm",
      };

      const result = generateDataAttributes(props);

      expect(result).toEqual({
        "data-variant": "secondary",
        "data-size": "sm",
      });
    });

    it("should handle numeric values for variant and size", () => {
      const props = {
        variant: 1,
        size: 2,
      };

      const result = generateDataAttributes(props);

      expect(result).toEqual({
        "data-variant": 1,
        "data-size": 2,
      });
    });

    it("should always use true for boolean state attributes", () => {
      const props = {
        loading: "yes", // Truthy string
        disabled: 1, // Truthy number
        active: [], // Truthy array
        selected: {}, // Truthy object
      };

      const result = generateDataAttributes(props);

      expect(result).toEqual({
        "data-loading": true, // Always true, not the original value
        "data-disabled": true,
        "data-active": true,
        "data-selected": true,
      });
    });
  });

  describe("CSS selector compatibility", () => {
    it("should generate attributes suitable for CSS selectors", () => {
      const props = {
        variant: "primary",
        size: "lg",
        loading: true,
        disabled: true,
        active: true,
      };

      const result = generateDataAttributes(props);

      // These attributes should be usable in CSS like:
      // [data-variant="primary"] { ... }
      // [data-size="lg"] { ... }
      // [data-loading] { ... }
      // [data-disabled] { ... }
      expect(result["data-variant"]).toBe("primary");
      expect(result["data-size"]).toBe("lg");
      expect(result["data-loading"]).toBe(true);
      expect(result["data-disabled"]).toBe(true);
      expect(result["data-active"]).toBe(true);
    });

    it("should work with Tailwind arbitrary value selectors", () => {
      const props = {
        variant: "outline-destructive",
        size: "2xl",
        loading: true,
      };

      const result = generateDataAttributes(props);

      // Should work with selectors like:
      // data-[variant="outline-destructive"]:border-red-500
      // data-[size="2xl"]:text-2xl
      // data-[loading]:opacity-50
      expect(result["data-variant"]).toBe("outline-destructive");
      expect(result["data-size"]).toBe("2xl");
      expect(result["data-loading"]).toBe(true);
    });
  });

  describe("performance considerations", () => {
    it("should handle large props objects efficiently", () => {
      const props: Record<string, unknown> = {
        // Relevant props
        variant: "primary",
        size: "lg",
        loading: true,
        disabled: false,
        active: true,
      };

      // Add munknown irrelevant props
      Array.from({ length: 100 }, (_, i) => {
        props[`prop${i}`] = `value${i}`;
      });

      const start = performance.now();
      const result = generateDataAttributes(props);
      const end = performance.now();

      expect(end - start).toBeLessThan(5); // Should be very fast
      expect(result).toEqual({
        "data-variant": "primary",
        "data-size": "lg",
        "data-loading": true,
        "data-disabled": true,
        "data-active": true,
      });
    });

    it("should not modify the original props object", () => {
      const originalProps = {
        variant: "primary",
        loading: true,
        active: false,
      };

      const originalPropsCopy = { ...originalProps };
      generateDataAttributes(originalProps);

      expect(originalProps).toEqual(originalPropsCopy);
    });

    it("should be a pure function", () => {
      const props = {
        variant: "primary",
        size: "lg",
        loading: true,
      };

      const result1 = generateDataAttributes(props);
      const result2 = generateDataAttributes(props);

      expect(result1).toEqual(result2);
      expect(result1).not.toBe(result2); // Different object references
    });
  });

  describe("accessibility and testing support", () => {
    it("should generate attributes useful for testing", () => {
      const props = {
        variant: "primary",
        loading: true,
        disabled: false,
        invalid: true,
      };

      const result = generateDataAttributes(props);

      // These attributes can be used in tests like:
      // screen.getByRole('button', { selector: '[data-variant="primary"]' })
      // expect(element).toHaveAttribute('data-loading')
      expect(result).toEqual({
        "data-variant": "primary",
        "data-loading": true,
        "data-disabled": true, // loading implies disabled
        "data-invalid": true,
      });
    });

    it("should provide state visibility for debugging", () => {
      const props = {
        variant: "destructive",
        size: "sm",
        loading: false,
        disabled: true,
        active: false,
        selected: true,
        expanded: false,
        pressed: true,
      };

      const result = generateDataAttributes(props);

      // These attributes make component state visible in dev tools
      expect(result).toEqual({
        "data-variant": "destructive",
        "data-size": "sm",
        "data-disabled": true,
        "data-selected": true,
        "data-pressed": true,
      });
    });
  });
});
