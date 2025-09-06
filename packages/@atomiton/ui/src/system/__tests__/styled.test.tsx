import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { forwardRef } from "react";
import { styled } from "../styled";

// Mock the utilities
vi.mock("../utils/extractSystemProps", () => ({
  extractSystemProps: vi.fn((props) => {
    const systemClasses = [];
    const restProps = { ...props };

    // Mock system prop extraction
    if (props.m) {
      systemClasses.push(`m-${props.m}`);
      delete restProps.m;
    }
    if (props.p) {
      systemClasses.push(`p-${props.p}`);
      delete restProps.p;
    }
    if (props.bg) {
      systemClasses.push(`bg-${props.bg}`);
      delete restProps.bg;
    }
    if (props.fullWidth) {
      systemClasses.push("w-full");
      delete restProps.fullWidth;
    }
    if (props.fullHeight) {
      systemClasses.push("h-full");
      delete restProps.fullHeight;
    }

    return { systemClasses, restProps };
  }),
}));

vi.mock("../utils/generateDataAttributes", () => ({
  generateDataAttributes: vi.fn((props) => {
    const dataAttributes: Record<string, unknown> = {};
    if (props.variant) dataAttributes["data-variant"] = props.variant;
    if (props.size) dataAttributes["data-size"] = props.size;
    if (props.loading) {
      dataAttributes["data-loading"] = true;
      dataAttributes["data-disabled"] = true;
    }
    if (props.disabled) dataAttributes["data-disabled"] = true;
    return dataAttributes;
  }),
}));

vi.mock("../utils/filterDOMProps", () => ({
  filterDOMProps: vi.fn((props, isHTMLElement) => {
    if (!isHTMLElement) return props;

    const filtered = { ...props };
    // Mock filtering of system and component props
    delete filtered.variant;
    delete filtered.size;
    delete filtered.loading;
    return filtered;
  }),
}));

vi.mock("../utils/buildClassName", () => ({
  buildClassName: vi.fn((config) => {
    const parts = [];
    if (config.name) parts.push(`atomiton-${config.name.toLowerCase()}`);
    if (config.styleClasses) parts.push(config.styleClasses);
    if (config.systemClasses?.length)
      parts.push(config.systemClasses.join(" "));
    if (config.userClassName) parts.push(config.userClassName);
    return parts.join(" ");
  }),
}));

vi.mock("../utils/calculateStyleProps", () => ({
  calculateStyleProps: vi.fn((props) => ({
    ...props,
    disabled: props.disabled || props.loading,
    loading: props.loading,
  })),
}));

// Test components
interface BaseButtonProps
  extends React.PropsWithChildren<Record<string, unknown>> {
  className?: string;
}

const BaseButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
);
BaseButton.displayName = "BaseButton";

interface BaseDivProps
  extends React.PropsWithChildren<Record<string, unknown>> {
  className?: string;
}

const BaseDiv = forwardRef<HTMLDivElement, BaseDivProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
);
BaseDiv.displayName = "BaseDiv";

interface CustomComponentProps
  extends React.PropsWithChildren<Record<string, unknown>> {
  className?: string;
  variant?: string;
  customProp?: string;
}

const CustomComponent = forwardRef<HTMLDivElement, CustomComponentProps>(
  ({ className, variant, customProp, children, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      data-variant={variant}
      data-custom={customProp}
      {...props}
    >
      {children}
    </div>
  ),
);
CustomComponent.displayName = "CustomComponent";

describe("styled component wrapper", () => {
  describe("basic styling functionality", () => {
    it("should render a basic styled component", () => {
      const StyledButton = styled(BaseButton, {
        name: "button",
      });

      render(<StyledButton>Click me</StyledButton>);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Click me");
      expect(button).toHaveClass("atomiton-button");
    });

    it("should apply system props as classes", () => {
      const StyledDiv = styled(BaseDiv, {
        name: "container",
      });

      render(
        <StyledDiv m={4} p={2} bg="blue-500" fullWidth>
          Content
        </StyledDiv>,
      );

      const div = screen.getByText("Content");
      expect(div).toHaveClass(
        "atomiton-container",
        "m-4",
        "p-2",
        "bg-blue-500",
        "w-full",
      );
    });

    it("should combine user className with generated classes", () => {
      const StyledDiv = styled(BaseDiv);

      render(
        <StyledDiv className="user-class" m={4} p={2}>
          Content
        </StyledDiv>,
      );

      const div = screen.getByText("Content");
      expect(div).toHaveClass("m-4", "p-2", "user-class");
    });
  });

  describe("fullWidth and fullHeight props", () => {
    it("should apply fullWidth prop as w-full class", () => {
      const StyledDiv = styled(BaseDiv, {
        name: "layout",
      });

      render(
        <StyledDiv fullWidth data-testid="full-width">
          Full width content
        </StyledDiv>,
      );

      const div = screen.getByTestId("full-width");
      expect(div).toHaveClass("atomiton-layout", "w-full");
    });

    it("should apply fullHeight prop as h-full class", () => {
      const StyledDiv = styled(BaseDiv, {
        name: "layout",
      });

      render(
        <StyledDiv fullHeight data-testid="full-height">
          Full height content
        </StyledDiv>,
      );

      const div = screen.getByTestId("full-height");
      expect(div).toHaveClass("atomiton-layout", "h-full");
    });

    it("should apply both fullWidth and fullHeight together", () => {
      const StyledDiv = styled(BaseDiv, {
        name: "fullscreen",
      });

      render(
        <StyledDiv fullWidth fullHeight data-testid="fullscreen">
          Fullscreen content
        </StyledDiv>,
      );

      const div = screen.getByTestId("fullscreen");
      expect(div).toHaveClass("atomiton-fullscreen", "w-full", "h-full");
    });

    it("should not apply fullWidth/fullHeight classes when false", () => {
      const StyledDiv = styled(BaseDiv, {
        name: "container",
      });

      render(
        <StyledDiv fullWidth={false} fullHeight={false} data-testid="no-full">
          Normal content
        </StyledDiv>,
      );

      const div = screen.getByTestId("no-full");
      expect(div).toHaveClass("atomiton-container");
      expect(div).not.toHaveClass("w-full", "h-full");
    });
  });

  describe("configuration options", () => {
    it("should apply prop transformations", () => {
      const StyledButton = styled(BaseButton, {
        name: "button",
        props: (props) => ({
          ...props,
          variant: props.variant || "default",
          size: props.size || "md",
        }),
      });

      render(<StyledButton>Button</StyledButton>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-variant", "default");
      expect(button).toHaveAttribute("data-size", "md");
    });

    it("should apply style functions", () => {
      const mockStyles = vi.fn(() => "btn btn-primary");
      const StyledButton = styled(BaseButton, {
        name: "button",
        styles: mockStyles,
      });

      render(<StyledButton variant="primary">Button</StyledButton>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("atomiton-button", "btn", "btn-primary");
      expect(mockStyles).toHaveBeenCalled();
    });

    it("should combine prop transformation and styles", () => {
      const StyledButton = styled(BaseButton, {
        name: "button",
        props: (props) => ({
          ...props,
          variant: props.variant || "default",
        }),
        styles: (props) => `btn btn-${props.variant}`,
      });

      render(<StyledButton variant="primary">Button</StyledButton>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("atomiton-button", "btn", "btn-primary");
      expect(button).toHaveAttribute("data-variant", "primary");
    });
  });

  describe("polymorphic 'as' prop", () => {
    it("should render as different element when 'as' prop is provided", () => {
      const StyledComponent = styled(BaseDiv, {
        name: "polymorphic",
      });

      render(
        <StyledComponent as="span" data-testid="as-span">
          Rendered as span
        </StyledComponent>,
      );

      const span = screen.getByTestId("as-span");
      expect(span.tagName).toBe("SPAN");
      expect(span).toHaveClass("atomiton-polymorphic");
    });

    it("should render as custom component when 'as' prop is component", () => {
      const StyledComponent = styled(BaseDiv, {
        name: "custom",
      });

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
      expect(element).toHaveClass("atomiton-custom");
    });
  });

  describe("data attributes generation", () => {
    it("should generate data attributes for component state", () => {
      const StyledButton = styled(BaseButton, {
        name: "button",
      });

      render(
        <StyledButton
          variant="primary"
          size="lg"
          loading
          disabled
          data-testid="button"
        >
          Button
        </StyledButton>,
      );

      const button = screen.getByTestId("button");
      expect(button).toHaveAttribute("data-variant", "primary");
      expect(button).toHaveAttribute("data-size", "lg");
      expect(button).toHaveAttribute("data-loading", "true");
      expect(button).toHaveAttribute("data-disabled", "true");
    });

    it("should merge generated data attributes with existing ones", () => {
      const StyledButton = styled(BaseButton, {
        name: "button",
      });

      render(
        <StyledButton
          variant="secondary"
          data-custom="custom-value"
          data-testid="button"
        >
          Button
        </StyledButton>,
      );

      const button = screen.getByTestId("button");
      expect(button).toHaveAttribute("data-variant", "secondary");
      expect(button).toHaveAttribute("data-custom", "custom-value");
    });
  });

  describe("DOM prop filtering", () => {
    it("should filter out invalid DOM props for HTML elements", () => {
      const StyledButton = styled(
        "button" as unknown as React.ComponentType<Record<string, unknown>>,
        {
          name: "html-button",
        },
      );

      render(
        <StyledButton
          variant="primary"
          size="lg"
          loading={false}
          onClick={() => {}}
          data-testid="html-button"
        >
          HTML Button
        </StyledButton>,
      );

      const button = screen.getByTestId("html-button");
      expect(button).not.toHaveAttribute("variant");
      expect(button).not.toHaveAttribute("size");
      expect(button).not.toHaveAttribute("loading");
      expect(button).toHaveAttribute("data-testid", "html-button");
    });

    it("should pass all props to React components", () => {
      const StyledComponent = styled(CustomComponent, {
        name: "react-component",
      });

      render(
        <StyledComponent
          variant="primary"
          customProp="test-value"
          data-testid="react-component"
        >
          React Component
        </StyledComponent>,
      );

      const component = screen.getByTestId("react-component");
      expect(component).toHaveAttribute("data-variant", "primary");
      expect(component).toHaveAttribute("data-custom", "test-value");
    });
  });

  describe("ref forwarding", () => {
    it("should forward ref to the underlying component", () => {
      const StyledButton = styled(BaseButton, {
        name: "button",
      });

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
      expect(
        buttonRef && (buttonRef as unknown as HTMLButtonElement).textContent,
      ).toBe("Button with ref");
    });

    it("should work with forwardRef components", () => {
      const StyledDiv = styled(BaseDiv, {
        name: "div",
      });

      let divRef: HTMLDivElement | null = null;
      render(
        <StyledDiv
          ref={(el: HTMLDivElement | null) => {
            divRef = el;
          }}
        >
          Div with ref
        </StyledDiv>,
      );

      expect(divRef).toBeInstanceOf(HTMLDivElement);
      expect(divRef && (divRef as unknown as HTMLDivElement).textContent).toBe(
        "Div with ref",
      );
    });
  });

  describe("display names", () => {
    it("should set display name with component name when provided", () => {
      // Let me check what the actual implementation returns
      const StyledButton = styled(BaseButton, {
        name: "CustomButton",
      });

      // The actual implementation should use name || fallback
      // If name is "CustomButton", displayName should be "CustomButton"
      expect(StyledButton.displayName).toBe("CustomButton"); // The name should be used when provided
    });

    it("should set display name with Styled prefix when no name provided", () => {
      const StyledButton = styled(BaseButton);

      expect(StyledButton.displayName).toBe("Styled(BaseButton)");
    });

    it("should handle components without displayName", () => {
      function AnonymousComponent() {
        return <div>Anonymous</div>;
      }
      const StyledComponent = styled(AnonymousComponent);

      expect(StyledComponent.displayName).toBe("Styled(AnonymousComponent)");
    });
  });

  describe("integration scenarios", () => {
    it("should handle complex real-world component with all features", () => {
      const StyledCard = styled(BaseDiv, {
        name: "Card",
        props: (props) => ({
          ...props,
          variant: props.variant || "default",
          elevated: props.elevated || false,
        }),
        styles: (props) =>
          `card card-${props.variant} ${props.elevated ? "elevated" : ""}`,
      });

      render(
        <StyledCard
          variant="primary"
          elevated
          fullWidth
          m={4}
          p={6}
          className="custom-card-class"
          data-testid="complex-card"
        >
          Card Content
        </StyledCard>,
      );

      const card = screen.getByTestId("complex-card");
      expect(card).toHaveClass(
        "atomiton-card",
        "card",
        "card-primary",
        "elevated",
        "w-full",
        "m-4",
        "p-6",
        "custom-card-class",
      );
      expect(card).toHaveAttribute("data-variant", "primary");
    });

    it("should handle system props with styled props correctly", () => {
      const StyledButton = styled(BaseButton, {
        name: "ActionButton",
        props: (props) => ({
          ...props,
          size: props.size || "md",
          intent: props.intent || "primary",
        }),
        styles: (props) => `btn btn-${props.intent} btn-${props.size}`,
      });

      render(
        <StyledButton
          intent="destructive"
          size="lg"
          fullWidth
          m={2}
          p={3}
          bg="red-500"
          loading
          data-testid="action-button"
        >
          Delete Item
        </StyledButton>,
      );

      const button = screen.getByTestId("action-button");
      expect(button).toHaveClass(
        "atomiton-actionbutton",
        "btn",
        "btn-destructive",
        "btn-lg",
        "w-full",
        "m-2",
        "p-3",
        "bg-red-500",
      );
      expect(button).toHaveAttribute("data-size", "lg");
      expect(button).toHaveAttribute("data-loading", "true");
      expect(button).toHaveAttribute("data-disabled", "true");
    });
  });

  describe("edge cases", () => {
    it("should handle component with no props", () => {
      const StyledDiv = styled(BaseDiv);

      render(<StyledDiv>No props</StyledDiv>);

      const div = screen.getByText("No props");
      expect(div).toBeInTheDocument();
    });

    it("should handle empty configuration object", () => {
      const StyledDiv = styled(BaseDiv, {});

      render(<StyledDiv m={4}>Empty config</StyledDiv>);

      const div = screen.getByText("Empty config");
      expect(div).toHaveClass("m-4");
    });

    it("should handle undefined system props", () => {
      const StyledDiv = styled(BaseDiv, {
        name: "test",
      });

      render(
        <StyledDiv m={undefined} p={undefined} fullWidth={undefined}>
          Undefined props
        </StyledDiv>,
      );

      const div = screen.getByText("Undefined props");
      expect(div).toHaveClass("atomiton-test");
      expect(div).not.toHaveClass("m-undefined", "p-undefined", "w-full");
    });

    it("should handle system props that resolve to empty strings", () => {
      const StyledDiv = styled(BaseDiv, {
        name: "test",
      });

      render(
        <StyledDiv fullWidth={false} fullHeight={false}>
          False boolean props
        </StyledDiv>,
      );

      const div = screen.getByText("False boolean props");
      expect(div).toHaveClass("atomiton-test");
      expect(div).not.toHaveClass("w-full", "h-full");
    });
  });
});
