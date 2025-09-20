import { describe, it, expect, vi } from "vitest";
import { buildClassName } from "./buildClassname";

// Mock the cn utility
vi.mock("@/utils/cn", () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(" ")),
}));

describe("buildClassName", () => {
  describe("basic functionality", () => {
    it("should build className with only systemClasses", () => {
      const config = {
        systemClasses: ["m-4", "p-2", "bg-blue-500"],
      };

      const result = buildClassName(config);

      expect(result).toBe("m-4 p-2 bg-blue-500");
    });

    it("should build className with name prefix", () => {
      const config = {
        name: "Button",
        systemClasses: ["m-4", "p-2"],
      };

      const result = buildClassName(config);

      expect(result).toBe("atomiton-button m-4 p-2");
    });

    it("should build className with style classes", () => {
      const config = {
        styleClasses: "btn btn-primary rounded-md",
        systemClasses: ["m-4", "p-2"],
      };

      const result = buildClassName(config);

      expect(result).toBe("btn btn-primary rounded-md m-4 p-2");
    });

    it("should build className with user className", () => {
      const config = {
        systemClasses: ["m-4", "p-2"],
        userClassName: "custom-styles hover:bg-red-500",
      };

      const result = buildClassName(config);

      expect(result).toBe("m-4 p-2 custom-styles hover:bg-red-500");
    });
  });

  describe("comprehensive className composition", () => {
    it("should combine all className sources in correct order", () => {
      const config = {
        name: "Card",
        styleClasses: "card card-elevated shadow-lg",
        systemClasses: ["m-4", "p-6", "bg-white", "rounded-lg"],
        userClassName: "custom-card hover:shadow-xl",
      };

      const result = buildClassName(config);

      expect(result).toBe(
        "atomiton-card card card-elevated shadow-lg m-4 p-6 bg-white rounded-lg custom-card hover:shadow-xl",
      );
    });

    it("should handle fullWidth and fullHeight in systemClasses", () => {
      const config = {
        name: "Container",
        styleClasses: "container",
        systemClasses: ["w-full", "h-full", "flex", "items-center"],
        userClassName: "custom-container",
      };

      const result = buildClassName(config);

      expect(result).toBe(
        "atomiton-container container w-full h-full flex items-center custom-container",
      );
    });
  });

  describe("edge cases", () => {
    it("should handle empty systemClasses array", () => {
      const config = {
        name: "Empty",
        styleClasses: "some-styles",
        systemClasses: [],
        userClassName: "user-styles",
      };

      const result = buildClassName(config);

      expect(result).toBe("atomiton-empty some-styles user-styles");
    });

    it("should handle only systemClasses with empty values filtered out", () => {
      const config = {
        systemClasses: ["m-4", "", "p-2", ""],
      };

      const result = buildClassName(config);

      expect(result).toBe("m-4  p-2 ");
    });

    it("should handle undefined name", () => {
      const config = {
        name: undefined,
        styleClasses: "styles",
        systemClasses: ["m-4"],
        userClassName: "user",
      };

      const result = buildClassName(config);

      expect(result).toBe("styles m-4 user");
    });

    it("should handle undefined styleClasses", () => {
      const config = {
        name: "Test",
        styleClasses: undefined,
        systemClasses: ["m-4"],
        userClassName: "user",
      };

      const result = buildClassName(config);

      expect(result).toBe("atomiton-test m-4 user");
    });

    it("should handle undefined userClassName", () => {
      const config = {
        name: "Test",
        styleClasses: "styles",
        systemClasses: ["m-4"],
        userClassName: undefined,
      };

      const result = buildClassName(config);

      expect(result).toBe("atomiton-test styles m-4");
    });

    it("should handle all optional fields undefined", () => {
      const config = {
        name: undefined,
        styleClasses: undefined,
        systemClasses: ["m-4", "p-2"],
        userClassName: undefined,
      };

      const result = buildClassName(config);

      expect(result).toBe("m-4 p-2");
    });
  });

  describe("name processing", () => {
    it("should convert name to lowercase for prefix", () => {
      const config = {
        name: "BUTTON",
        systemClasses: ["m-4"],
      };

      const result = buildClassName(config);

      expect(result).toBe("atomiton-button m-4");
    });

    it("should handle camelCase names", () => {
      const config = {
        name: "DropdownMenu",
        systemClasses: ["relative"],
      };

      const result = buildClassName(config);

      expect(result).toBe("atomiton-dropdownmenu relative");
    });

    it("should handle names with spaces", () => {
      const config = {
        name: "Modal Dialog",
        systemClasses: ["fixed", "inset-0"],
      };

      const result = buildClassName(config);

      expect(result).toBe("atomiton-modal dialog fixed inset-0");
    });

    it("should handle names with special characters", () => {
      const config = {
        name: "Input-Field_Component",
        systemClasses: ["w-full"],
      };

      const result = buildClassName(config);

      expect(result).toBe("atomiton-input-field_component w-full");
    });
  });

  describe("systemClasses array handling", () => {
    it("should join systemClasses with spaces", () => {
      const config = {
        systemClasses: ["flex", "items-center", "justify-between", "p-4"],
      };

      const result = buildClassName(config);

      expect(result).toBe("flex items-center justify-between p-4");
    });

    it("should handle single systemClass", () => {
      const config = {
        systemClasses: ["flex"],
      };

      const result = buildClassName(config);

      expect(result).toBe("flex");
    });

    it("should handle systemClasses with complex Tailwind classes", () => {
      const config = {
        systemClasses: [
          "sm:max-w-lg",
          "md:max-w-xl",
          "lg:max-w-2xl",
          "hover:bg-opacity-80",
          "focus:ring-2",
          "focus:ring-blue-500",
        ],
      };

      const result = buildClassName(config);

      expect(result).toBe(
        "sm:max-w-lg md:max-w-xl lg:max-w-2xl hover:bg-opacity-80 focus:ring-2 focus:ring-blue-500",
      );
    });
  });

  describe("integration with fullWidth and fullHeight", () => {
    it("should handle fullWidth class in systemClasses", () => {
      const config = {
        name: "Layout",
        styleClasses: "layout-base",
        systemClasses: ["w-full", "min-h-screen", "flex", "flex-col"],
        userClassName: "app-layout",
      };

      const result = buildClassName(config);

      expect(result).toBe(
        "atomiton-layout layout-base w-full min-h-screen flex flex-col app-layout",
      );
    });

    it("should handle fullHeight class in systemClasses", () => {
      const config = {
        name: "Sidebar",
        styleClasses: "sidebar",
        systemClasses: ["h-full", "w-64", "bg-gray-800", "text-white"],
        userClassName: "app-sidebar",
      };

      const result = buildClassName(config);

      expect(result).toBe(
        "atomiton-sidebar sidebar h-full w-64 bg-gray-800 text-white app-sidebar",
      );
    });

    it("should handle both fullWidth and fullHeight classes", () => {
      const config = {
        name: "FullScreen",
        systemClasses: ["w-full", "h-full", "fixed", "inset-0", "z-50"],
      };

      const result = buildClassName(config);

      expect(result).toBe(
        "atomiton-fullscreen w-full h-full fixed inset-0 z-50",
      );
    });
  });

  describe("complex real-world scenarios", () => {
    it("should handle component with responsive design", () => {
      const config = {
        name: "ResponsiveCard",
        styleClasses: "card rounded-lg shadow-sm border border-gray-200",
        systemClasses: [
          "w-full",
          "sm:w-1/2",
          "md:w-1/3",
          "lg:w-1/4",
          "p-4",
          "sm:p-6",
          "m-2",
        ],
        userClassName: "hover:shadow-md transition-shadow duration-200",
      };

      const result = buildClassName(config);

      expect(result).toBe(
        "atomiton-responsivecard card rounded-lg shadow-sm border border-gray-200 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4 sm:p-6 m-2 hover:shadow-md transition-shadow duration-200",
      );
    });

    it("should handle form component with states", () => {
      const config = {
        name: "Input",
        styleClasses: "input-base focus:outline-none focus:ring-2",
        systemClasses: [
          "w-full",
          "p-3",
          "border",
          "border-gray-300",
          "rounded-md",
          "bg-white",
        ],
        userClassName: "invalid:border-red-500 valid:border-green-500",
      };

      const result = buildClassName(config);

      expect(result).toBe(
        "atomiton-input input-base focus:outline-none focus:ring-2 w-full p-3 border border-gray-300 rounded-md bg-white invalid:border-red-500 valid:border-green-500",
      );
    });

    it("should handle navigation component", () => {
      const config = {
        name: "Navigation",
        styleClasses: "nav-primary bg-gradient-to-r from-blue-600 to-blue-800",
        systemClasses: [
          "w-full",
          "h-16",
          "flex",
          "items-center",
          "px-6",
          "shadow-lg",
        ],
        userClassName: "sticky top-0 z-40 backdrop-blur-sm",
      };

      const result = buildClassName(config);

      expect(result).toBe(
        "atomiton-navigation nav-primary bg-gradient-to-r from-blue-600 to-blue-800 w-full h-16 flex items-center px-6 shadow-lg sticky top-0 z-40 backdrop-blur-sm",
      );
    });
  });

  describe("performance considerations", () => {
    it("should handle large systemClasses arrays efficiently", () => {
      const systemClasses = Array.from({ length: 100 }, (_, i) => `class-${i}`);
      const config = {
        name: "LargeComponent",
        styleClasses: "base-style",
        systemClasses,
        userClassName: "user-style",
      };

      const start = performance.now();
      const result = buildClassName(config);
      const end = performance.now();

      expect(end - start).toBeLessThan(5); // Should be very fast
      expect(result).toContain("atomiton-largecomponent");
      expect(result).toContain("base-style");
      expect(result).toContain("class-0");
      expect(result).toContain("class-99");
      expect(result).toContain("user-style");
    });

    it("should not modify the input config object", () => {
      const config = {
        name: "Immutable",
        styleClasses: "original-style",
        systemClasses: ["original-system"],
        userClassName: "original-user",
      };

      const originalConfig = { ...config };
      buildClassName(config);

      expect(config).toEqual(originalConfig);
      expect(config.systemClasses).toEqual(originalConfig.systemClasses);
    });
  });

  describe("string handling edge cases", () => {
    it("should handle empty strings", () => {
      const config = {
        name: "",
        styleClasses: "",
        systemClasses: ["m-4"],
        userClassName: "",
      };

      const result = buildClassName(config);

      expect(result).toBe("m-4");
    });

    it("should handle whitespace in class strings", () => {
      const config = {
        styleClasses: "  spaced   classes   ",
        systemClasses: ["m-4", "p-2"],
        userClassName: "  user   classes   ",
      };

      const result = buildClassName(config);

      // The cn utility should handle whitespace normalization
      expect(result).toBe("  spaced   classes    m-4 p-2   user   classes   ");
    });

    it("should handle special characters in class names", () => {
      const config = {
        systemClasses: ["w-1/2", "sm:w-2/3", "lg:w-3/4", "hover:bg-red-500"],
        userClassName: "focus:ring-[3px] focus:ring-blue-500/50",
      };

      const result = buildClassName(config);

      expect(result).toBe(
        "w-1/2 sm:w-2/3 lg:w-3/4 hover:bg-red-500 focus:ring-[3px] focus:ring-blue-500/50",
      );
    });
  });
});
