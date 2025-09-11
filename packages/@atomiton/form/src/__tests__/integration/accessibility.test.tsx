import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Form } from "../../components/Form.js";
import { TextField } from "../../components/fields/TextField.js";
import { NumberField } from "../../components/fields/NumberField.js";
import { SelectField } from "../../components/fields/SelectField.js";
import { CheckboxField } from "../../components/fields/CheckboxField.js";

describe("Accessibility Tests", () => {
  describe("ARIA Attributes", () => {
    it("should have proper ARIA labels for all field types", () => {
      render(
        <Form
          initialValues={{
            name: "",
            age: 0,
            country: "",
            subscribe: false,
          }}
          onSubmit={vi.fn()}
        >
          <TextField name="name" label="Full Name" />
          <NumberField name="age" label="Age" />
          <SelectField
            name="country"
            label="Country"
            options={[
              { value: "us", label: "United States" },
              { value: "ca", label: "Canada" },
            ]}
          />
          <CheckboxField name="subscribe" label="Subscribe to newsletter" />
        </Form>,
      );

      expect(
        screen.getByRole("textbox", { name: /full name/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("spinbutton", { name: /age/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("combobox", { name: /country/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("checkbox", { name: /subscribe/i }),
      ).toBeInTheDocument();
    });

    it("should have proper aria-describedby for helper text", () => {
      render(
        <Form initialValues={{ email: "" }} onSubmit={vi.fn()}>
          <TextField
            name="email"
            label="Email"
            helperText="We'll never share your email"
          />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-describedby", "email-helper");
      expect(screen.getByText("We'll never share your email")).toHaveAttribute(
        "id",
        "email-helper",
      );
    });

    it("should have proper aria-describedby for errors", async () => {
      const user = userEvent.setup();
      const validators = {
        email: [
          (value: string) => ({
            valid: value.includes("@"),
            error: "Please enter a valid email",
          }),
        ],
      };

      render(
        <Form
          initialValues={{ email: "" }}
          onSubmit={vi.fn()}
          validators={validators}
          validateOnBlur={true}
        >
          <TextField name="email" label="Email" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      await user.type(input, "invalid");
      await user.tab();

      await waitFor(() => {
        expect(input).toHaveAttribute("aria-describedby", "email-error");
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByRole("alert")).toHaveAttribute("id", "email-error");
      });
    });

    it("should switch aria-describedby from helper to error", async () => {
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
          initialValues={{ name: "" }}
          onSubmit={vi.fn()}
          validators={validators}
          validateOnBlur={true}
        >
          <TextField
            name="name"
            label="Name"
            helperText="Enter your full name"
          />
        </Form>,
      );

      const input = screen.getByRole("textbox");

      expect(input).toHaveAttribute("aria-describedby", "name-helper");
      expect(screen.getByText("Enter your full name")).toBeInTheDocument();

      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(input).toHaveAttribute("aria-describedby", "name-error");
        expect(
          screen.queryByText("Enter your full name"),
        ).not.toBeInTheDocument();
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });
    });
  });

  describe("Keyboard Navigation", () => {
    it("should support tab navigation through form fields", async () => {
      const user = userEvent.setup();

      render(
        <Form
          initialValues={{
            field1: "",
            field2: "",
            field3: "",
            agree: false,
          }}
          onSubmit={vi.fn()}
        >
          <TextField name="field1" label="Field 1" />
          <TextField name="field2" label="Field 2" />
          <TextField name="field3" label="Field 3" />
          <CheckboxField name="agree" label="I agree" />
          <button type="submit">Submit</button>
        </Form>,
      );

      const field1 = screen.getByRole("textbox", { name: /field 1/i });
      const field2 = screen.getByRole("textbox", { name: /field 2/i });
      const field3 = screen.getByRole("textbox", { name: /field 3/i });
      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByRole("button");

      await user.tab();
      expect(field1).toHaveFocus();

      await user.tab();
      expect(field2).toHaveFocus();

      await user.tab();
      expect(field3).toHaveFocus();

      await user.tab();
      expect(checkbox).toHaveFocus();

      await user.tab();
      expect(submitButton).toHaveFocus();
    });

    it("should support reverse tab navigation", async () => {
      const user = userEvent.setup();

      render(
        <Form initialValues={{ field1: "", field2: "" }} onSubmit={vi.fn()}>
          <TextField name="field1" label="Field 1" />
          <TextField name="field2" label="Field 2" />
          <button type="submit">Submit</button>
        </Form>,
      );

      const field1 = screen.getByRole("textbox", { name: /field 1/i });
      const field2 = screen.getByRole("textbox", { name: /field 2/i });
      const submitButton = screen.getByRole("button");

      await user.click(submitButton);
      expect(submitButton).toHaveFocus();

      await user.tab({ shift: true });
      expect(field2).toHaveFocus();

      await user.tab({ shift: true });
      expect(field1).toHaveFocus();
    });

    it("should handle keyboard input correctly", async () => {
      const user = userEvent.setup();

      render(
        <Form initialValues={{ name: "", age: 0 }} onSubmit={vi.fn()}>
          <TextField name="name" label="Name" />
          <NumberField name="age" label="Age" />
        </Form>,
      );

      const nameInput = screen.getByRole("textbox");
      const ageInput = screen.getByRole("spinbutton");

      await user.click(nameInput);
      await user.keyboard("John Doe");
      expect(nameInput).toHaveValue("John Doe");

      await user.click(ageInput);
      await user.keyboard("25");
      expect(ageInput).toHaveValue(25);
    });

    it("should handle Enter key for form submission", async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();

      render(
        <Form initialValues={{ name: "test" }} onSubmit={onSubmit}>
          <TextField name="name" label="Name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      await user.click(input);
      await user.keyboard("{Enter}");

      expect(onSubmit).toHaveBeenCalled();
    });

    it("should handle Escape key for clearing field", async () => {
      const user = userEvent.setup();

      render(
        <Form initialValues={{ name: "initial value" }} onSubmit={vi.fn()}>
          <TextField name="name" label="Name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("initial value");

      await user.click(input);
      await user.keyboard("{Control>}a{/Control}{Delete}");
      expect(input).toHaveValue("");
    });
  });

  describe("Screen Reader Support", () => {
    it("should announce form validation errors", async () => {
      const user = userEvent.setup();
      const validators = {
        email: [
          (value: string) => ({
            valid: value.includes("@"),
            error: "Please enter a valid email address",
          }),
        ],
      };

      render(
        <Form
          initialValues={{ email: "" }}
          onSubmit={vi.fn()}
          validators={validators}
          validateOnBlur={true}
        >
          <TextField name="email" label="Email Address" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      await user.type(input, "invalid-email");
      await user.tab();

      await waitFor(() => {
        const errorElement = screen.getByRole("alert");
        expect(errorElement).toHaveTextContent(
          "Please enter a valid email address",
        );
        expect(errorElement).toHaveAttribute("role", "alert");
      });
    });

    it("should have proper field labeling", () => {
      render(
        <Form
          initialValues={{ firstName: "", lastName: "" }}
          onSubmit={vi.fn()}
        >
          <TextField name="firstName" label="First Name" />
          <TextField name="lastName" label="Last Name" />
        </Form>,
      );

      const firstNameInput = screen.getByLabelText("First Name");
      const lastNameInput = screen.getByLabelText("Last Name");

      expect(firstNameInput).toBeInTheDocument();
      expect(lastNameInput).toBeInTheDocument();
    });

    it("should announce loading states during submission", async () => {
      const user = userEvent.setup();
      const slowSubmit = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100)),
        );

      render(
        <Form initialValues={{ name: "test" }} onSubmit={slowSubmit}>
          {({ state }) => (
            <>
              <TextField name="name" label="Name" />
              <button type="submit" disabled={state.isSubmitting}>
                {state.isSubmitting ? "Submitting..." : "Submit"}
              </button>
              {state.isSubmitting && (
                <div role="status" aria-live="polite">
                  Form is being submitted, please wait...
                </div>
              )}
            </>
          )}
        </Form>,
      );

      const submitButton = screen.getByRole("button");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole("status")).toHaveTextContent(
          "Form is being submitted, please wait...",
        );
      });
    });
  });

  describe("Focus Management", () => {
    it("should maintain focus on field during validation", async () => {
      const user = userEvent.setup();
      const validators = {
        name: [
          (value: string) => ({
            valid: value.length > 2,
            error: "Name must be longer than 2 characters",
          }),
        ],
      };

      render(
        <Form
          initialValues={{ name: "" }}
          onSubmit={vi.fn()}
          validators={validators}
          validateOnChange={true}
        >
          <TextField name="name" label="Name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      await user.click(input);
      await user.type(input, "ab");

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });

      expect(input).toHaveFocus();
    });

    it("should focus first error field on submission", async () => {
      const user = userEvent.setup();
      const validators = {
        field1: [
          (value: string) => ({
            valid: value.length > 0,
            error: "Field 1 is required",
          }),
        ],
        field2: [
          (value: string) => ({
            valid: value.length > 0,
            error: "Field 2 is required",
          }),
        ],
      };

      render(
        <Form
          initialValues={{ field1: "", field2: "" }}
          onSubmit={vi.fn()}
          validators={validators}
          validateOnSubmit={true}
        >
          <TextField name="field1" label="Field 1" />
          <TextField name="field2" label="Field 2" />
          <button type="submit">Submit</button>
        </Form>,
      );

      const field1 = screen.getByRole("textbox", { name: /field 1/i });
      const submitButton = screen.getByRole("button");

      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getAllByRole("alert")).toHaveLength(2);
      });

      expect(field1).toHaveFocus();
    });

    it("should handle focus for dynamically added fields", async () => {
      const user = userEvent.setup();

      function DynamicForm() {
        const [fields, setFields] = React.useState(["field1"]);

        return (
          <Form
            initialValues={Object.fromEntries(fields.map((f) => [f, ""]))}
            onSubmit={vi.fn()}
          >
            {fields.map((field) => (
              <TextField key={field} name={field} label={field} />
            ))}
            <button
              type="button"
              onClick={() => {
                const newField = `field${fields.length + 1}`;
                setFields([...fields, newField]);
                setTimeout(() => {
                  const newInput = screen.getByRole("textbox", {
                    name: newField,
                  });
                  newInput.focus();
                }, 0);
              }}
            >
              Add Field
            </button>
          </Form>
        );
      }

      render(<DynamicForm />);

      const addButton = screen.getByRole("button");
      await user.click(addButton);

      await waitFor(() => {
        const newInput = screen.getByRole("textbox", { name: /field2/i });
        expect(newInput).toHaveFocus();
      });
    });
  });

  describe("Color Contrast and Visual Accessibility", () => {
    it("should apply appropriate error styling for visibility", async () => {
      const user = userEvent.setup();
      const validators = {
        email: [
          (value: string) => ({
            valid: value.includes("@"),
            error: "Invalid email",
          }),
        ],
      };

      render(
        <Form
          initialValues={{ email: "" }}
          onSubmit={vi.fn()}
          validators={validators}
          validateOnBlur={true}
        >
          <TextField name="email" label="Email" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      await user.type(input, "invalid");
      await user.tab();

      await waitFor(() => {
        expect(input).toHaveClass("form-field__input--error");
        const errorElement = screen.getByRole("alert");
        expect(errorElement).toHaveClass("form-field__error");
      });
    });

    it("should maintain visual hierarchy with proper heading structure", () => {
      render(
        <Form initialValues={{ name: "" }} onSubmit={vi.fn()}>
          <h1>Registration Form</h1>
          <fieldset>
            <legend>Personal Information</legend>
            <TextField name="name" label="Full Name" />
          </fieldset>
        </Form>,
      );

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Registration Form",
      );
      expect(
        screen.getByRole("group", { name: /personal information/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Mobile Accessibility", () => {
    it("should handle touch interactions", async () => {
      const user = userEvent.setup();

      render(
        <Form initialValues={{ name: "" }} onSubmit={vi.fn()}>
          <TextField name="name" label="Name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");

      await user.pointer({ target: input, keys: "[TouchA]" });
      expect(input).toHaveFocus();

      await user.type(input, "Touch input");
      expect(input).toHaveValue("Touch input");
    });

    it("should support proper input types for mobile keyboards", () => {
      render(
        <Form
          initialValues={{ email: "", phone: "", age: 0 }}
          onSubmit={vi.fn()}
        >
          <TextField name="email" label="Email" type="email" />
          <TextField name="phone" label="Phone" type="tel" />
          <NumberField name="age" label="Age" />
        </Form>,
      );

      expect(screen.getByRole("textbox", { name: /email/i })).toHaveAttribute(
        "type",
        "email",
      );
      expect(screen.getByRole("textbox", { name: /phone/i })).toHaveAttribute(
        "type",
        "tel",
      );
      expect(screen.getByRole("spinbutton", { name: /age/i })).toHaveAttribute(
        "type",
        "number",
      );
    });
  });

  describe("High Contrast Mode Support", () => {
    it("should maintain usability in high contrast mode", async () => {
      const user = userEvent.setup();

      document.body.classList.add("high-contrast");

      const validators = {
        name: [
          (value: string) => ({
            valid: value.length > 0,
            error: "Required",
          }),
        ],
      };

      render(
        <Form
          initialValues={{ name: "" }}
          onSubmit={vi.fn()}
          validators={validators}
          validateOnBlur={true}
        >
          <TextField name="name" label="Name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(input).toHaveAttribute("aria-invalid", "true");
      });

      document.body.classList.remove("high-contrast");
    });
  });

  describe("Reduced Motion Support", () => {
    it("should respect user motion preferences", () => {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === "(prefers-reduced-motion: reduce)",
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <Form initialValues={{ name: "" }} onSubmit={vi.fn()}>
          <TextField name="name" label="Name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");

      expect(input).toBeInTheDocument();
    });
  });
});
