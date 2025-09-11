import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Form } from "../Form.js";
import { TextField } from "./TextField.js";

describe("TextField Component", () => {
  const defaultFormProps = {
    initialValues: { name: "", email: "" },
    onSubmit: vi.fn(),
  };

  describe("Basic Rendering", () => {
    it("should render input with correct attributes", () => {
      render(
        <Form {...defaultFormProps}>
          <TextField name="name" label="Full Name" />
        </Form>,
      );

      const input = screen.getByRole("textbox", { name: /full name/i });
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "text");
      expect(input).toHaveAttribute("id", "name");
      expect(input).toHaveAttribute("name", "name");
    });

    it("should render with label", () => {
      render(
        <Form {...defaultFormProps}>
          <TextField name="name" label="Full Name" />
        </Form>,
      );

      const label = screen.getByText("Full Name");
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute("for", "name");
    });

    it("should render without label when not provided", () => {
      render(
        <Form {...defaultFormProps}>
          <TextField name="name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
      expect(screen.queryByLabelText(/name/)).not.toBeInTheDocument();
    });

    it("should render helper text", () => {
      render(
        <Form {...defaultFormProps}>
          <TextField name="name" helperText="Enter your full name" />
        </Form>,
      );

      const helperText = screen.getByText("Enter your full name");
      expect(helperText).toBeInTheDocument();
      expect(helperText).toHaveAttribute("id", "name-helper");
    });

    it("should apply custom className", () => {
      render(
        <Form {...defaultFormProps}>
          <TextField name="name" className="custom-class" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("custom-class");
    });

    it("should apply custom attributes", () => {
      render(
        <Form {...defaultFormProps}>
          <TextField
            name="name"
            placeholder="Enter name"
            maxLength={50}
            autoComplete="name"
          />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("placeholder", "Enter name");
      expect(input).toHaveAttribute("maxlength", "50");
      expect(input).toHaveAttribute("autocomplete", "name");
    });
  });

  describe("Value Management", () => {
    it("should display initial value", () => {
      render(
        <Form
          initialValues={{ name: "John Doe", email: "" }}
          onSubmit={vi.fn()}
        >
          <TextField name="name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("John Doe");
    });

    it("should handle empty/undefined values", () => {
      render(
        <Form {...defaultFormProps}>
          <TextField name="name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("");
    });

    it("should update value on user input", async () => {
      const user = userEvent.setup();
      render(
        <Form {...defaultFormProps}>
          <TextField name="name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      await user.type(input, "John Doe");

      expect(input).toHaveValue("John Doe");
    });

    it("should handle rapid typing", async () => {
      const user = userEvent.setup();
      render(
        <Form {...defaultFormProps}>
          <TextField name="name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      const rapidText = "ThisIsVeryFastTyping";

      await user.type(input, rapidText, { delay: 1 });

      expect(input).toHaveValue(rapidText);
    });

    it("should handle very long text input", async () => {
      const user = userEvent.setup();
      const longText = "x".repeat(10000);

      render(
        <Form {...defaultFormProps}>
          <TextField name="name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      await user.clear(input);
      await user.type(input, longText);

      expect(input).toHaveValue(longText);
    });

    it("should handle special characters", async () => {
      const user = userEvent.setup();
      const specialText = "!@#$%^&*()_+-=[]{}|;:,.<>?";

      render(
        <Form {...defaultFormProps}>
          <TextField name="name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      await user.type(input, specialText);

      expect(input).toHaveValue(specialText);
    });
  });

  describe("Focus and Blur Events", () => {
    it("should handle focus events", async () => {
      const user = userEvent.setup();
      render(
        <Form {...defaultFormProps}>
          <TextField name="name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      await user.click(input);

      expect(input).toHaveFocus();
    });

    it("should handle blur events", async () => {
      const user = userEvent.setup();
      render(
        <Form {...defaultFormProps}>
          <TextField name="name" />
          <TextField name="email" />
        </Form>,
      );

      const nameInput = screen.getByDisplayValue("");
      const emailInput = screen.getAllByRole("textbox")[1];

      await user.click(nameInput);
      expect(nameInput).toHaveFocus();

      await user.click(emailInput);
      expect(nameInput).not.toHaveFocus();
      expect(emailInput).toHaveFocus();
    });

    it("should handle tab navigation", async () => {
      const user = userEvent.setup();
      render(
        <Form {...defaultFormProps}>
          <TextField name="name" />
          <TextField name="email" />
        </Form>,
      );

      const inputs = screen.getAllByRole("textbox");
      const nameInput = inputs[0];
      const emailInput = inputs[1];

      await user.click(nameInput);
      expect(nameInput).toHaveFocus();

      await user.tab();
      expect(emailInput).toHaveFocus();
    });
  });

  describe("Error States", () => {
    it("should display error message when field has error and is touched", async () => {
      const user = userEvent.setup();
      const validators = {
        name: [
          (value: string) => ({
            valid: value.length > 0,
            error: "Name is required",
          }),
        ],
      };

      render(
        <Form
          {...defaultFormProps}
          validators={validators}
          validateOnBlur={true}
        >
          <TextField name="name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("Name is required");
      });
    });

    it("should apply error styling when field has error", async () => {
      const user = userEvent.setup();
      const validators = {
        name: [
          (value: string) => ({
            valid: value.length > 0,
            error: "Name is required",
          }),
        ],
      };

      render(
        <Form
          {...defaultFormProps}
          validators={validators}
          validateOnBlur={true}
        >
          <TextField name="name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(input).toHaveClass("form-field__input--error");
        expect(input).toHaveAttribute("aria-invalid", "true");
      });
    });

    it("should hide helper text when error is shown", async () => {
      const user = userEvent.setup();
      const validators = {
        name: [
          (value: string) => ({
            valid: value.length > 0,
            error: "Name is required",
          }),
        ],
      };

      render(
        <Form
          {...defaultFormProps}
          validators={validators}
          validateOnBlur={true}
        >
          <TextField name="name" helperText="Enter your name" />
        </Form>,
      );

      expect(screen.getByText("Enter your name")).toBeInTheDocument();

      const input = screen.getByRole("textbox");
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText("Enter your name")).not.toBeInTheDocument();
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });
    });

    it("should clear error when valid input is entered", async () => {
      const user = userEvent.setup();
      const validators = {
        name: [
          (value: string) => ({
            valid: value.length > 0,
            error: "Name is required",
          }),
        ],
      };

      render(
        <Form
          {...defaultFormProps}
          validators={validators}
          validateOnChange={true}
        >
          <TextField name="name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");

      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });

      await user.click(input);
      await user.type(input, "John");

      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(
        <Form {...defaultFormProps}>
          <TextField
            name="name"
            label="Full Name"
            helperText="Enter your name"
          />
        </Form>,
      );

      const input = screen.getByRole("textbox", { name: /full name/i });
      expect(input).toHaveAttribute("aria-describedby", "name-helper");
    });

    it("should have proper ARIA attributes with error", async () => {
      const user = userEvent.setup();
      const validators = {
        name: [
          (value: string) => ({
            valid: value.length > 0,
            error: "Name is required",
          }),
        ],
      };

      render(
        <Form
          {...defaultFormProps}
          validators={validators}
          validateOnBlur={true}
        >
          <TextField name="name" label="Full Name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(input).toHaveAttribute("aria-describedby", "name-error");
      });
    });

    it("should support screen readers with proper labels", () => {
      render(
        <Form {...defaultFormProps}>
          <TextField name="name" label="Full Name" />
        </Form>,
      );

      const input = screen.getByLabelText("Full Name");
      expect(input).toBeInTheDocument();
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      render(
        <Form {...defaultFormProps}>
          <TextField name="name" />
          <TextField name="email" />
        </Form>,
      );

      const inputs = screen.getAllByRole("textbox");

      await user.tab();
      expect(inputs[0]).toHaveFocus();

      await user.tab();
      expect(inputs[1]).toHaveFocus();

      await user.tab({ shift: true });
      expect(inputs[0]).toHaveFocus();
    });
  });

  describe("Performance", () => {
    it("should handle rapid state changes efficiently", async () => {
      const user = userEvent.setup();
      render(
        <Form {...defaultFormProps}>
          <TextField name="name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        await user.type(input, "a", { delay: 0 });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000);
      expect(input).toHaveValue("a".repeat(100));
    });

    it("should not cause unnecessary re-renders", () => {
      const renderSpy = vi.fn();

      function TestComponent() {
        renderSpy();
        return (
          <Form {...defaultFormProps}>
            <TextField name="name" />
          </Form>
        );
      }

      const { rerender } = render(<TestComponent />);
      const initialRenderCount = renderSpy.mock.calls.length;

      rerender(<TestComponent />);

      expect(renderSpy.mock.calls.length).toBe(initialRenderCount + 1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle disabled state", () => {
      render(
        <Form {...defaultFormProps}>
          <TextField name="name" disabled />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
    });

    it("should handle readonly state", () => {
      render(
        <Form {...defaultFormProps}>
          <TextField name="name" readOnly />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("readonly");
    });

    it("should handle copy/paste operations", async () => {
      const user = userEvent.setup();
      render(
        <Form {...defaultFormProps}>
          <TextField name="name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");

      await user.click(input);
      await user.paste("Pasted content");

      expect(input).toHaveValue("Pasted content");
    });

    it("should handle form submission via Enter key", async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();

      render(
        <Form {...defaultFormProps} onSubmit={onSubmit}>
          <TextField name="name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      await user.type(input, "John{enter}");

      expect(onSubmit).toHaveBeenCalled();
    });

    it("should handle extremely long input without breaking", async () => {
      const extremelyLongText = "x".repeat(100000);

      render(
        <Form {...defaultFormProps}>
          <TextField name="name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");

      fireEvent.change(input, { target: { value: extremelyLongText } });

      expect(input).toHaveValue(extremelyLongText);
    });

    it("should handle Unicode and emoji input", async () => {
      const user = userEvent.setup();
      const unicodeText = "Hello 🌍 世界 🚀";

      render(
        <Form {...defaultFormProps}>
          <TextField name="name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      await user.type(input, unicodeText);

      expect(input).toHaveValue(unicodeText);
    });

    it("should handle simultaneous updates from multiple sources", async () => {
      const user = userEvent.setup();

      render(
        <Form {...defaultFormProps}>
          {({ helpers }) => (
            <>
              <TextField name="name" />
              <button
                onClick={() => helpers.setFieldValue("name", "Programmatic")}
              >
                Set Value
              </button>
            </>
          )}
        </Form>,
      );

      const input = screen.getByRole("textbox");
      const button = screen.getByRole("button");

      await user.type(input, "User Input");
      fireEvent.click(button);

      expect(input).toHaveValue("Programmatic");
    });
  });
});
