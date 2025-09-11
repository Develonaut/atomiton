import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from "react";
import { Form } from "../Form.js";
import { NumberField } from "./NumberField.js";

describe("NumberField Component", () => {
  const defaultFormProps = {
    initialValues: { age: 0, price: 0 },
    onSubmit: vi.fn(),
  };

  describe("Basic Rendering", () => {
    it("should render number input with correct attributes", () => {
      render(
        <Form {...defaultFormProps}>
          <NumberField name="age" label="Age" />
        </Form>,
      );

      const input = screen.getByRole("spinbutton", { name: /age/i });
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "number");
      expect(input).toHaveAttribute("id", "age");
      expect(input).toHaveAttribute("name", "age");
    });

    it("should apply number-specific styling", () => {
      render(
        <Form {...defaultFormProps}>
          <NumberField name="age" />
        </Form>,
      );

      const input = screen.getByRole("spinbutton");
      expect(input).toHaveClass("form-field__input--number");
    });
  });

  describe("Value Management", () => {
    it("should display initial numeric value", () => {
      render(
        <Form initialValues={{ age: 25, price: 0 }} onSubmit={vi.fn()}>
          <NumberField name="age" />
        </Form>,
      );

      const input = screen.getByRole("spinbutton");
      expect(input).toHaveValue(25);
    });

    it("should handle zero value", () => {
      render(
        <Form {...defaultFormProps}>
          <NumberField name="age" />
        </Form>,
      );

      const input = screen.getByRole("spinbutton");
      expect(input).toHaveValue(null);
    });

    it("should handle decimal numbers", async () => {
      const user = userEvent.setup();
      render(
        <Form {...defaultFormProps}>
          <NumberField name="price" step="0.01" />
        </Form>,
      );

      const input = screen.getByRole("spinbutton");
      await user.clear(input);
      await user.type(input, "19.99");

      expect(input).toHaveValue(19.99);
    });

    it("should handle negative numbers", async () => {
      const user = userEvent.setup();
      render(
        <Form {...defaultFormProps}>
          <NumberField name="age" />
        </Form>,
      );

      const input = screen.getByRole("spinbutton");
      await user.clear(input);
      await user.type(input, "-5");

      expect(input).toHaveValue(-5);
    });

    it("should handle large numbers", async () => {
      const user = userEvent.setup();
      const largeNumber = 999999999;

      render(
        <Form {...defaultFormProps}>
          <NumberField name="age" />
        </Form>,
      );

      const input = screen.getByRole("spinbutton");
      await user.clear(input);
      await user.type(input, largeNumber.toString());

      expect(input).toHaveValue(largeNumber);
    });
  });

  describe("Input Parsing", () => {
    it("should parse valid number strings", async () => {
      const user = userEvent.setup();
      render(
        <Form {...defaultFormProps}>
          <NumberField name="age" />
        </Form>,
      );

      const input = screen.getByRole("spinbutton");
      await user.clear(input);
      await user.type(input, "42");

      expect(input).toHaveValue(42);
    });

    it("should handle empty input", async () => {
      const user = userEvent.setup();
      render(
        <Form initialValues={{ age: 25 }} onSubmit={vi.fn()}>
          <NumberField name="age" />
        </Form>,
      );

      const input = screen.getByRole("spinbutton");
      await user.clear(input);

      expect(input).toHaveValue(null);
    });

    it("should handle invalid number input gracefully", async () => {
      const user = userEvent.setup();
      render(
        <Form {...defaultFormProps}>
          <NumberField name="age" />
        </Form>,
      );

      const input = screen.getByRole("spinbutton");

      await user.type(input, "abc");

      expect(input).toHaveValue(null);
    });

    it("should handle scientific notation", async () => {
      const user = userEvent.setup();
      render(
        <Form {...defaultFormProps}>
          <NumberField name="age" />
        </Form>,
      );

      const input = screen.getByRole("spinbutton");
      await user.clear(input);
      await user.type(input, "1e6");

      expect(input).toHaveValue(1000000);
    });
  });

  describe("Validation", () => {
    it("should validate minimum value", async () => {
      const user = userEvent.setup();
      const validators = {
        age: [
          (value: number) => ({
            valid: value >= 18,
            error: "Must be at least 18",
          }),
        ],
      };

      render(
        <Form
          {...defaultFormProps}
          validators={validators}
          validateOnBlur={true}
        >
          <NumberField name="age" />
        </Form>,
      );

      const input = screen.getByRole("spinbutton");
      await user.clear(input);
      await user.type(input, "16");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          "Must be at least 18",
        );
      });
    });

    it("should validate maximum value", async () => {
      const user = userEvent.setup();
      const validators = {
        age: [
          (value: number) => ({
            valid: value <= 100,
            error: "Must be under 100",
          }),
        ],
      };

      render(
        <Form
          {...defaultFormProps}
          validators={validators}
          validateOnBlur={true}
        >
          <NumberField name="age" />
        </Form>,
      );

      const input = screen.getByRole("spinbutton");
      await user.clear(input);
      await user.type(input, "150");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          "Must be under 100",
        );
      });
    });

    it("should validate required number field", async () => {
      const user = userEvent.setup();
      const validators = {
        age: [
          (value: number) => ({
            valid: value > 0,
            error: "Age is required",
          }),
        ],
      };

      render(
        <Form
          {...defaultFormProps}
          validators={validators}
          validateOnBlur={true}
        >
          <NumberField name="age" />
        </Form>,
      );

      const input = screen.getByRole("spinbutton");
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("Age is required");
      });
    });
  });

  describe("Browser Controls", () => {
    it("should handle step increment", async () => {
      const user = userEvent.setup();
      render(
        <Form initialValues={{ age: 20 }} onSubmit={vi.fn()}>
          <NumberField name="age" step="5" />
        </Form>,
      );

      const input = screen.getByRole("spinbutton");
      expect(input).toHaveValue(20);

      await user.click(input);
      await user.keyboard("{ArrowUp}");

      expect(input).toHaveValue(25);
    });

    it("should handle step decrement", async () => {
      const user = userEvent.setup();
      render(
        <Form initialValues={{ age: 20 }} onSubmit={vi.fn()}>
          <NumberField name="age" step="3" />
        </Form>,
      );

      const input = screen.getByRole("spinbutton");
      expect(input).toHaveValue(20);

      await user.click(input);
      await user.keyboard("{ArrowDown}");

      expect(input).toHaveValue(17);
    });

    it("should respect min and max constraints", async () => {
      const user = userEvent.setup();
      render(
        <Form initialValues={{ age: 18 }} onSubmit={vi.fn()}>
          <NumberField name="age" min="0" max="100" />
        </Form>,
      );

      const input = screen.getByRole("spinbutton");
      await user.clear(input);
      await user.type(input, "-5");

      await user.clear(input);
      await user.type(input, "150");

      expect(input).toHaveAttribute("min", "0");
      expect(input).toHaveAttribute("max", "100");
    });
  });

  describe("Edge Cases", () => {
    it("should handle very small decimal numbers", async () => {
      const user = userEvent.setup();
      render(
        <Form {...defaultFormProps}>
          <NumberField name="price" step="0.001" />
        </Form>,
      );

      const input = screen.getByRole("spinbutton");
      await user.clear(input);
      await user.type(input, "0.001");

      expect(input).toHaveValue(0.001);
    });

    it("should handle floating point precision issues", async () => {
      const user = userEvent.setup();
      render(
        <Form {...defaultFormProps}>
          <NumberField name="price" />
        </Form>,
      );

      const input = screen.getByRole("spinbutton");
      await user.clear(input);
      await user.type(input, "0.1");

      await user.clear(input);
      await user.type(input, "0.2");

      expect(input).toHaveValue(0.2);
    });

    it("should handle copy/paste of numeric values", async () => {
      const user = userEvent.setup();
      render(
        <Form {...defaultFormProps}>
          <NumberField name="age" />
        </Form>,
      );

      const input = screen.getByRole("spinbutton");
      await user.click(input);
      await user.paste("42");

      expect(input).toHaveValue(42);
    });

    it("should handle disabled state", () => {
      render(
        <Form {...defaultFormProps}>
          <NumberField name="age" disabled />
        </Form>,
      );

      const input = screen.getByRole("spinbutton");
      expect(input).toBeDisabled();
    });

    it("should handle readonly state", () => {
      render(
        <Form {...defaultFormProps}>
          <NumberField name="age" readOnly />
        </Form>,
      );

      const input = screen.getByRole("spinbutton");
      expect(input).toHaveAttribute("readonly");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(
        <Form {...defaultFormProps}>
          <NumberField name="age" label="Age" helperText="Enter your age" />
        </Form>,
      );

      const input = screen.getByRole("spinbutton", { name: /age/i });
      expect(input).toHaveAttribute("aria-describedby", "age-helper");
    });

    it("should have proper ARIA attributes with error", async () => {
      const user = userEvent.setup();
      const validators = {
        age: [
          (value: number) => ({
            valid: value > 0,
            error: "Age is required",
          }),
        ],
      };

      render(
        <Form
          {...defaultFormProps}
          validators={validators}
          validateOnBlur={true}
        >
          <NumberField name="age" label="Age" />
        </Form>,
      );

      const input = screen.getByRole("spinbutton");
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(input).toHaveAttribute("aria-describedby", "age-error");
      });
    });
  });

  describe("Performance", () => {
    it("should handle rapid numeric input efficiently", async () => {
      const user = userEvent.setup();
      render(
        <Form {...defaultFormProps}>
          <NumberField name="age" />
        </Form>,
      );

      const input = screen.getByRole("spinbutton");
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        await user.clear(input);
        await user.type(input, i.toString(), { delay: 0 });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000);
      expect(input).toHaveValue(99);
    });
  });
});
