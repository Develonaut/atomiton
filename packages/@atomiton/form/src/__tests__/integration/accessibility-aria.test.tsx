import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Form } from "../../components/Form.js";
import { TextField } from "../../components/fields/TextField.js";
import { NumberField } from "../../components/fields/NumberField.js";
import { SelectField } from "../../components/fields/SelectField.js";
import { CheckboxField } from "../../components/fields/CheckboxField.js";

describe("ARIA Attributes", () => {
  it("should have proper ARIA labels for all field types", () => {
    render(
      <Form initialValues={{}} onSubmit={() => {}}>
        <TextField name="text" label="Text Field" />
        <NumberField name="number" label="Number Field" />
        <SelectField
          name="select"
          label="Select Field"
          options={[
            { value: "option1", label: "Option 1" },
            { value: "option2", label: "Option 2" },
          ]}
        />
        <CheckboxField name="checkbox" label="Checkbox Field" />
      </Form>,
    );

    expect(screen.getByLabelText("Text Field")).toHaveAttribute(
      "aria-label",
      "Text Field",
    );
    expect(screen.getByLabelText("Number Field")).toHaveAttribute(
      "aria-label",
      "Number Field",
    );
    expect(screen.getByLabelText("Select Field")).toHaveAttribute(
      "aria-label",
      "Select Field",
    );
    expect(screen.getByLabelText("Checkbox Field")).toHaveAttribute(
      "aria-label",
      "Checkbox Field",
    );
  });

  it("should have proper aria-describedby for helper text", () => {
    render(
      <Form initialValues={{}} onSubmit={() => {}}>
        <TextField
          name="email"
          label="Email"
          helperText="Enter your email address"
        />
      </Form>,
    );

    const input = screen.getByLabelText("Email");
    const helperText = screen.getByText("Enter your email address");

    expect(input).toHaveAttribute("aria-describedby", helperText.id);
  });

  it("should have proper aria-describedby for errors", async () => {
    const user = userEvent.setup();

    render(
      <Form
        initialValues={{ email: "" }}
        onSubmit={() => {}}
        validators={{
          email: [
            (value) =>
              !value
                ? { valid: false, error: "Email is required" }
                : { valid: true },
          ],
        }}
        validateOnBlur={true}
      >
        <TextField name="email" label="Email" />
      </Form>,
    );

    const input = screen.getByLabelText("Email");

    await user.click(input);
    await user.tab();

    await waitFor(() => {
      const errorMessage = screen.getByText("Email is required");
      expect(input).toHaveAttribute("aria-describedby", errorMessage.id);
      expect(input).toHaveAttribute("aria-invalid", "true");
    });
  });

  it("should switch aria-describedby from helper to error", async () => {
    const user = userEvent.setup();

    render(
      <Form
        initialValues={{ email: "" }}
        onSubmit={() => {}}
        validators={{
          email: [
            (value) =>
              !value
                ? { valid: false, error: "Email is required" }
                : { valid: true },
          ],
        }}
        validateOnBlur={true}
      >
        <TextField
          name="email"
          label="Email"
          helperText="Enter your email address"
        />
      </Form>,
    );

    const input = screen.getByLabelText("Email");
    const helperText = screen.getByText("Enter your email address");

    expect(input).toHaveAttribute("aria-describedby", helperText.id);

    await user.click(input);
    await user.tab();

    await waitFor(() => {
      const errorMessage = screen.getByText("Email is required");
      expect(input).toHaveAttribute("aria-describedby", errorMessage.id);
      expect(input).toHaveAttribute("aria-invalid", "true");
    });
  });
});
