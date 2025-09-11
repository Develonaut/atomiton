import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Form } from "../../components/Form.js";
import { TextField } from "../../components/fields/TextField.js";
import { NumberField } from "../../components/fields/NumberField.js";
import { CheckboxField } from "../../components/fields/CheckboxField.js";

describe("Keyboard Navigation", () => {
  it("should support tab navigation through form fields", async () => {
    const user = userEvent.setup();

    render(
      <Form initialValues={{}} onSubmit={() => {}}>
        <TextField name="firstName" label="First Name" />
        <TextField name="lastName" label="Last Name" />
        <NumberField name="age" label="Age" />
        <CheckboxField name="terms" label="Accept Terms" />
        <button type="submit">Submit</button>
      </Form>,
    );

    const firstNameInput = screen.getByLabelText("First Name");
    const lastNameInput = screen.getByLabelText("Last Name");
    const ageInput = screen.getByLabelText("Age");
    const termsCheckbox = screen.getByLabelText("Accept Terms");
    const submitButton = screen.getByRole("button", { name: "Submit" });

    firstNameInput.focus();
    expect(document.activeElement).toBe(firstNameInput);

    await user.tab();
    expect(document.activeElement).toBe(lastNameInput);

    await user.tab();
    expect(document.activeElement).toBe(ageInput);

    await user.tab();
    expect(document.activeElement).toBe(termsCheckbox);

    await user.tab();
    expect(document.activeElement).toBe(submitButton);
  });

  it("should support reverse tab navigation", async () => {
    const user = userEvent.setup();

    render(
      <Form initialValues={{}} onSubmit={() => {}}>
        <TextField name="firstName" label="First Name" />
        <TextField name="lastName" label="Last Name" />
        <button type="submit">Submit</button>
      </Form>,
    );

    const firstNameInput = screen.getByLabelText("First Name");
    const lastNameInput = screen.getByLabelText("Last Name");
    const submitButton = screen.getByRole("button", { name: "Submit" });

    submitButton.focus();
    expect(document.activeElement).toBe(submitButton);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(lastNameInput);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(firstNameInput);
  });

  it("should handle keyboard input correctly", async () => {
    const user = userEvent.setup();

    render(
      <Form initialValues={{}} onSubmit={() => {}}>
        <TextField name="text" label="Text Field" />
        <CheckboxField name="checkbox" label="Checkbox" />
      </Form>,
    );

    const textInput = screen.getByLabelText("Text Field");
    const checkbox = screen.getByLabelText("Checkbox");

    await user.click(textInput);
    await user.type(textInput, "Hello World");
    expect(textInput).toHaveValue("Hello World");

    await user.tab();
    await user.keyboard(" ");
    expect(checkbox).toBeChecked();
  });

  it("should handle Enter key for form submission", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <Form initialValues={{ name: "" }} onSubmit={onSubmit}>
        <TextField name="name" label="Name" />
        <button type="submit">Submit</button>
      </Form>,
    );

    const nameInput = screen.getByLabelText("Name");
    await user.type(nameInput, "John");
    await user.keyboard("{Enter}");

    expect(onSubmit).toHaveBeenCalledWith({ name: "John" });
  });

  it("should handle Escape key for clearing field", async () => {
    const user = userEvent.setup();

    render(
      <Form initialValues={{}} onSubmit={() => {}}>
        <TextField name="text" label="Text Field" />
      </Form>,
    );

    const textInput = screen.getByLabelText("Text Field");

    await user.type(textInput, "Some text");
    expect(textInput).toHaveValue("Some text");

    await user.keyboard("{Escape}");
    expect(textInput).toHaveValue("");
  });
});
