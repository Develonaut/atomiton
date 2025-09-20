import { MockButton, MockDiv } from "../test-utils";
import { render, screen } from "@testing-library/react";
import { forwardRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { styled } from "./styled";

// Mock the cn utility
vi.mock("@/utils/cn", () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(" ")),
}));

// Mock CVA
vi.mock("class-variance-authority", () => ({
  cva: vi.fn((base: string | string[], config?: Record<string, unknown>) => {
    return vi.fn((variants?: Record<string, unknown>) => {
      // Handle base classes - join array to string if needed
      const baseClasses = Array.isArray(base) ? base.join(" ") : base;

      if (!config?.variants) return baseClasses;

      // Merge with default variants first
      const mergedVariants = {
        ...((config.defaultVariants as Record<string, unknown>) || {}),
        ...(variants || {}),
      };

      const variantClasses = Object.entries(mergedVariants)
        .map(([key, value]) => {
          const variantConfig = (
            config.variants as Record<string, Record<string, unknown>>
          )[key];
          if (variantConfig && value && variantConfig[value as string]) {
            const variantValue = variantConfig[value as string];
            return Array.isArray(variantValue)
              ? variantValue.join(" ")
              : variantValue;
          }
          return "";
        })
        .filter(Boolean)
        .join(" ");

      return [baseClasses, variantClasses].filter(Boolean).join(" ");
    });
  }),
}));

// Use centralized mock components
type MockDivProps = React.ComponentProps<typeof MockDiv> & {
  variant?: "card" | "panel";
};

describe("styled function", () => {
  describe("basic styled component creation", () => {
    it("should create a basic styled component with base classes", () => {
      const StyledButton = styled(MockButton)("btn rounded-md");

      render(<StyledButton>Click me</StyledButton>);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Click me");
      expect(button).toHaveClass("btn rounded-md");
    });

    it("should create styled component with array of base classes", () => {
      const StyledDiv = styled(MockDiv)(["flex", "items-center", "gap-4"]);

      render(<StyledDiv>Content</StyledDiv>);

      const div = screen.getByText("Content");
      expect(div).toHaveClass("flex items-center gap-4");
    });

    it("should create styled component without base classes", () => {
      const StyledDiv = styled(MockDiv)("");

      render(<StyledDiv>Empty base</StyledDiv>);

      const div = screen.getByText("Empty base");
      expect(div).toBeInTheDocument();
    });
  });

  describe("variant application", () => {
    it("should apply variants correctly", () => {
      const StyledButton = styled(MockButton)("btn", {
        variants: {
          variant: {
            primary: "bg-blue-500 text-white",
            secondary: "bg-gray-200 text-gray-800",
          },
          size: {
            sm: "px-2 py-1 text-sm",
            md: "px-4 py-2",
            lg: "px-6 py-3 text-lg",
          },
        },
      });

      render(
        <StyledButton variant="primary" size="lg">
          Button
        </StyledButton>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "btn bg-blue-500 text-white px-6 py-3 text-lg",
      );
    });

    it("should apply default variants when no props provided", () => {
      const StyledButton = styled(MockButton)("btn", {
        variants: {
          variant: {
            primary: "bg-blue-500",
            secondary: "bg-gray-200",
          },
        },
        defaultVariants: {
          variant: "primary",
        },
      });

      render(<StyledButton>Default</StyledButton>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn bg-blue-500");
    });

    it("should handle array variant values", () => {
      const StyledDiv = styled(MockDiv)("base", {
        variants: {
          variant: {
            card: ["bg-white", "shadow-lg", "rounded-lg"],
            panel: ["bg-gray-50", "border", "border-gray-200"],
          },
        },
      });

      render(<StyledDiv variant="card">Card content</StyledDiv>);

      const div = screen.getByText("Card content");
      expect(div).toHaveClass("base bg-white shadow-lg rounded-lg");
    });

    it("should separate variant props from other props", () => {
      const StyledButton = styled(MockButton)("btn", {
        variants: {
          variant: {
            primary: "bg-blue-500",
          },
        },
      });

      render(
        <StyledButton variant="primary" onClick={() => {}} disabled>
          Button with props
        </StyledButton>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn bg-blue-500");
      expect(button).toHaveAttribute("disabled");
      expect(button).not.toHaveAttribute("variant");
    });
  });

  describe("className merging", () => {
    it("should merge className with variant classes", () => {
      const StyledButton = styled(MockButton)("btn", {
        variants: {
          variant: {
            primary: "bg-blue-500",
          },
        },
      });

      render(
        <StyledButton variant="primary" className="custom-class">
          Button
        </StyledButton>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn bg-blue-500 custom-class");
    });

    it("should handle className when no variants are provided", () => {
      const StyledDiv = styled(MockDiv)("base-class");

      render(<StyledDiv className="user-class">Content</StyledDiv>);

      const div = screen.getByText("Content");
      expect(div).toHaveClass("base-class user-class");
    });
  });

  describe("props resolver functionality", () => {
    it("should apply props resolver transformations", () => {
      const StyledButton = styled(MockButton, {
        props: (props) => ({
          ...props,
          variant: props.variant || "primary",
          "data-resolved": "true",
        }),
      })("btn", {
        variants: {
          variant: {
            primary: "bg-blue-500",
            secondary: "bg-gray-200",
          },
        },
      });

      render(<StyledButton>Resolved</StyledButton>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn bg-blue-500");
      expect(button).toHaveAttribute("data-resolved", "true");
    });

    it("should run props resolver before extracting as prop (critical bug fix)", () => {
      const propsResolver = vi.fn((props) => ({
        ...props,
        as: props.as === "link" ? "a" : props.as,
      }));

      const StyledComponent = styled(MockDiv, {
        props: propsResolver,
      })("component");

      render(<StyledComponent as="link">Link component</StyledComponent>);

      expect(propsResolver).toHaveBeenCalledWith(
        expect.objectContaining({ as: "link" }),
      );

      const element = screen.getByText("Link component");
      expect(element.tagName).toBe("A");
    });

    it("should handle props resolver returning modified as prop", () => {
      const StyledComponent = styled("div", {
        props: (props) => ({
          ...props,
          as: props.variant === "link" ? "a" : props.as,
          href: props.variant === "link" ? "#" : undefined,
        }),
      })("styled-component");

      render(
        <StyledComponent variant="link">Transformed to link</StyledComponent>,
      );

      const element = screen.getByText("Transformed to link");
      expect(element.tagName).toBe("A");
      expect(element).toHaveAttribute("href", "#");
    });
  });

  describe("polymorphic as prop", () => {
    it("should render as different element when as prop is provided", () => {
      const StyledComponent = styled(MockDiv)("component");

      render(
        <StyledComponent as="span" data-testid="as-span">
          Rendered as span
        </StyledComponent>,
      );

      const element = screen.getByTestId("as-span");
      expect(element.tagName).toBe("SPAN");
      expect(element).toHaveClass("component");
    });

    it("should render as custom component with as prop", () => {
      const CustomComponent = forwardRef<
        HTMLDivElement,
        { customProp?: string; children?: React.ReactNode }
      >(({ customProp, children, ...props }, ref) => (
        <div ref={ref} data-custom={customProp} {...props}>
          {children}
        </div>
      ));
      CustomComponent.displayName = "CustomComponent";

      const StyledComponent = styled(MockDiv)("component");

      render(
        <StyledComponent
          as={CustomComponent}
          customProp="test"
          data-testid="custom"
        >
          Custom component
        </StyledComponent>,
      );

      const element = screen.getByTestId("custom");
      expect(element).toHaveAttribute("data-custom", "test");
      expect(element).toHaveClass("component");
    });

    it("should use original component when no as prop provided", () => {
      const StyledButton = styled(MockButton)("styled-btn");

      render(<StyledButton>Original component</StyledButton>);

      const button = screen.getByRole("button");
      expect(button.tagName).toBe("BUTTON");
      expect(button).toHaveClass("styled-btn");
    });
  });

  describe("forward ref functionality", () => {
    it("should forward ref to the rendered component", () => {
      const StyledButton = styled(MockButton)("styled-btn");

      let buttonRef: HTMLButtonElement | null = null;
      render(
        <StyledButton
          ref={(el: HTMLButtonElement | null) => {
            buttonRef = el;
          }}
        >
          Button with ref
        </StyledButton>,
      );

      expect(buttonRef).toBeInstanceOf(HTMLButtonElement);
      expect((buttonRef as unknown as HTMLButtonElement)?.textContent).toBe(
        "Button with ref",
      );
    });

    it("should forward ref when using as prop", () => {
      const StyledComponent = styled(MockDiv)("component");

      let spanRef: HTMLSpanElement | null = null;
      render(
        <StyledComponent
          as="span"
          ref={(el: HTMLSpanElement | null) => {
            spanRef = el;
          }}
        >
          Span with ref
        </StyledComponent>,
      );

      expect(spanRef).toBeInstanceOf(HTMLSpanElement);
      expect((spanRef as unknown as HTMLSpanElement)?.textContent).toBe(
        "Span with ref",
      );
    });
  });

  describe("display name configuration", () => {
    it("should set display name when provided in config", () => {
      const StyledButton = styled(MockButton, {
        name: "CustomButton",
      })("btn");

      expect(StyledButton.displayName).toBe("CustomButton");
    });

    it("should not have display name when not provided", () => {
      const StyledButton = styled(MockButton)("btn");

      expect(StyledButton.displayName).toBeUndefined();
    });
  });

  describe("edge cases and error handling", () => {
    it("should handle undefined/null props", () => {
      const StyledButton = styled(MockButton)("btn", {
        variants: {
          variant: {
            primary: "bg-blue-500",
          },
        },
      });

      render(
        <StyledButton variant={undefined} className={undefined}>
          Undefined props
        </StyledButton>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn");
      expect(button).not.toHaveClass("bg-blue-500");
    });

    it("should handle empty variant configuration", () => {
      const StyledDiv = styled(MockDiv)("base", {});

      render(<StyledDiv>Empty config</StyledDiv>);

      const div = screen.getByText("Empty config");
      expect(div).toHaveClass("base");
    });

    it("should handle variant prop that doesn't exist in config", () => {
      const StyledButton = styled(MockButton)("btn", {
        variants: {
          variant: {
            primary: "bg-blue-500",
          },
        },
      });

      render(
        <StyledButton variant={"nonexistent" as "primary" | "secondary"}>
          Invalid variant
        </StyledButton>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn");
      expect(button).not.toHaveClass("bg-blue-500");
    });

    it("should handle props resolver returning empty object", () => {
      const StyledDiv = styled(MockDiv, {
        props: (props) => ({ ...props }),
      })("base");

      expect(() => {
        render(<StyledDiv>Empty resolver</StyledDiv>);
      }).not.toThrow();
    });

    it("should handle props resolver throwing error", () => {
      const StyledDiv = styled(MockDiv, {
        props: (_props): MockDivProps & Record<string, unknown> => {
          throw new Error("Props resolver error");
        },
      })("base");

      expect(() => {
        render(<StyledDiv>Error resolver</StyledDiv>);
      }).toThrow("Props resolver error");
    });

    it("should handle complex nested variant objects", () => {
      const StyledButton = styled(MockButton)("btn", {
        variants: {
          variant: {
            primary: "bg-blue-500",
            secondary: "bg-gray-200",
          },
          size: {
            sm: "text-sm px-2 py-1",
            md: "text-base px-4 py-2",
          },
          disabled: {
            true: "opacity-50 cursor-not-allowed",
            false: "opacity-100",
          },
        },
        defaultVariants: {
          variant: "primary",
          size: "md",
          disabled: false,
        },
      });

      render(
        <StyledButton variant="secondary" size="sm" disabled={true}>
          Complex variants
        </StyledButton>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "btn",
        "bg-gray-200",
        "text-sm",
        "px-2",
        "py-1",
        "opacity-50",
        "cursor-not-allowed",
      );
    });
  });

  describe("automatic class name generation", () => {
    it("should generate automatic class name from config.name", () => {
      const StyledButton = styled(MockButton, {
        name: "Button",
      })("btn");

      render(<StyledButton>Auto class</StyledButton>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("atomiton-button btn");
    });

    it("should convert PascalCase to kebab-case correctly", () => {
      // Test various PascalCase patterns
      const testCases = [
        { name: "Button", expected: "atomiton-button" },
        { name: "ToolbarButton", expected: "atomiton-toolbar-button" },
        { name: "InspectorField", expected: "atomiton-inspector-field" },
        {
          name: "MyComplexComponent",
          expected: "atomiton-my-complex-component",
        },
        { name: "HTMLElement", expected: "atomiton-h-t-m-l-element" },
        { name: "SimpleDiv", expected: "atomiton-simple-div" },
      ];

      testCases.forEach(({ name, expected }) => {
        const StyledComponent = styled(MockDiv, { name })("base");
        render(<StyledComponent data-testid={name}>{name}</StyledComponent>);

        const element = screen.getByTestId(name);
        expect(element).toHaveClass(expected);
      });
    });

    it("should handle names with numbers correctly", () => {
      const testCases = [
        { name: "Button2", expected: "atomiton-button2" },
        { name: "H1Title", expected: "atomiton-h1-title" },
        { name: "Grid3Column", expected: "atomiton-grid3-column" },
      ];

      testCases.forEach(({ name, expected }) => {
        const StyledComponent = styled(MockDiv, { name })("base");
        render(<StyledComponent data-testid={name}>{name}</StyledComponent>);

        const element = screen.getByTestId(name);
        expect(element).toHaveClass(expected);
      });
    });

    it("should place auto-generated class first when using string base classes", () => {
      const StyledButton = styled(MockButton, {
        name: "ToolbarButton",
      })("btn rounded-md px-4");

      render(<StyledButton>First class test</StyledButton>);

      const button = screen.getByRole("button");
      // The auto class should be first
      expect(button.className).toMatch(/^atomiton-toolbar-button\s/);
      expect(button).toHaveClass("atomiton-toolbar-button btn rounded-md px-4");
    });

    it("should place auto-generated class first when using array base classes", () => {
      const StyledDiv = styled(MockDiv, {
        name: "InspectorField",
      })(["flex", "items-center", "gap-2"]);

      render(<StyledDiv>Array base test</StyledDiv>);

      const div = screen.getByText("Array base test");
      // The auto class should be first
      expect(div.className).toMatch(/^atomiton-inspector-field\s/);
      expect(div).toHaveClass(
        "atomiton-inspector-field flex items-center gap-2",
      );
    });

    it("should work with variants and preserve class order", () => {
      const StyledButton = styled(MockButton, {
        name: "ActionButton",
      })("btn", {
        variants: {
          variant: {
            primary: "bg-blue-500 text-white",
            secondary: "bg-gray-200 text-gray-800",
          },
        },
      });

      render(<StyledButton variant="primary">Variant test</StyledButton>);

      const button = screen.getByRole("button");
      expect(button.className).toMatch(/^atomiton-action-button\s/);
      expect(button).toHaveClass(
        "atomiton-action-button btn bg-blue-500 text-white",
      );
    });

    it("should work when no base classes are provided", () => {
      const StyledDiv = styled(MockDiv, {
        name: "EmptyBase",
      })("");

      render(<StyledDiv>No base classes</StyledDiv>);

      const div = screen.getByText("No base classes");
      expect(div).toHaveClass("atomiton-empty-base");
      expect(div.className.trim()).toBe("atomiton-empty-base");
    });

    it("should work with only variants, no base classes", () => {
      const StyledSpan = styled("span", {
        name: "StatusBadge",
      })("", {
        variants: {
          status: {
            success: "text-green-600 bg-green-100",
            error: "text-red-600 bg-red-100",
          },
        },
      });

      render(<StyledSpan status="success">Success</StyledSpan>);

      const span = screen.getByText("Success");
      expect(span).toHaveClass(
        "atomiton-status-badge text-green-600 bg-green-100",
      );
    });

    it("should not generate class when name is not provided", () => {
      const StyledButton = styled(MockButton)("btn rounded");

      render(<StyledButton>No auto class</StyledButton>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn rounded");
      expect(button.className).not.toMatch(/atomiton-/);
    });

    it("should work with custom className and preserve order", () => {
      const StyledDiv = styled(MockDiv, {
        name: "CustomDiv",
      })("base-class");

      render(
        <StyledDiv className="user-custom-class">Custom className</StyledDiv>,
      );

      const div = screen.getByText("Custom className");
      // Auto class first, then base classes, then custom className
      expect(div).toHaveClass(
        "atomiton-custom-div base-class user-custom-class",
      );
    });

    it("should work with props resolver and auto class generation", () => {
      const StyledButton = styled(MockButton, {
        name: "ResolvedButton",
        props: (props) => ({
          ...props,
          variant: props.variant || "primary",
          "data-resolved": "true",
        }),
      })("btn", {
        variants: {
          variant: {
            primary: "bg-blue-500",
            secondary: "bg-gray-200",
          },
        },
      });

      render(<StyledButton>Resolved with auto class</StyledButton>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("atomiton-resolved-button btn bg-blue-500");
      expect(button).toHaveAttribute("data-resolved", "true");
    });
  });

  describe("real-world usage scenarios", () => {
    it("should handle button component with all features including auto class", () => {
      const Button = styled(MockButton, {
        name: "Button",
        props: (props) => ({
          ...props,
          variant: props.variant || "primary",
          disabled: props.disabled || props.loading,
        }),
      })(["inline-flex", "items-center", "justify-center", "rounded-md"], {
        variants: {
          variant: {
            primary: "bg-blue-600 text-white hover:bg-blue-700",
            secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
            destructive: "bg-red-600 text-white hover:bg-red-700",
          },
          size: {
            sm: "h-8 px-3 text-sm",
            md: "h-10 px-4",
            lg: "h-12 px-6 text-lg",
          },
        },
        defaultVariants: {
          variant: "primary",
          size: "md",
        },
      });

      render(
        <Button
          variant="destructive"
          size="lg"
          loading={true}
          className="custom-button"
        >
          Delete Item
        </Button>,
      );

      const button = screen.getByRole("button");
      // Auto-generated class should be first
      expect(button.className).toMatch(/^atomiton-button\s/);
      expect(button).toHaveClass(
        "atomiton-button",
        "inline-flex",
        "items-center",
        "justify-center",
        "rounded-md",
        "bg-red-600",
        "text-white",
        "hover:bg-red-700",
        "h-12",
        "px-6",
        "text-lg",
        "custom-button",
      );
      expect(button).toHaveAttribute("disabled");
      expect(Button.displayName).toBe("Button");
    });

    it("should handle card component with polymorphic rendering and auto class", () => {
      const Card = styled("div", {
        name: "Card",
        props: (props) => ({
          ...props,
          as: props.href ? "a" : props.as,
        }),
      })("rounded-lg border bg-card text-card-foreground shadow-sm", {
        variants: {
          variant: {
            default: "",
            destructive: "border-destructive",
            outline: "border-2",
          },
        },
        defaultVariants: {
          variant: "default",
        },
      });

      render(
        <Card
          href="/link"
          variant="outline"
          className="hover:shadow-md"
          data-testid="polymorphic-card"
        >
          Card content
        </Card>,
      );

      const card = screen.getByTestId("polymorphic-card");
      expect(card.tagName).toBe("A");
      // Auto-generated class should be first
      expect(card.className).toMatch(/^atomiton-card\s/);
      expect(card).toHaveClass(
        "atomiton-card",
        "rounded-lg",
        "border",
        "bg-card",
        "text-card-foreground",
        "shadow-sm",
        "border-2",
        "hover:shadow-md",
      );
      expect(card).toHaveAttribute("href", "/link");
    });
  });
});
