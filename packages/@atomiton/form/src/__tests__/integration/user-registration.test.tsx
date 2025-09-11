import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { Form } from "../../components/Form.js";
import { TextField } from "../../components/fields/TextField.js";
import { NumberField } from "../../components/fields/NumberField.js";
import { CheckboxField } from "../../components/fields/CheckboxField.js";
import {
  createMockSubmit,
  userRegistrationValidators,
  defaultUserValues,
} from "../utils/test-helpers.js";
import userEvent from "@testing-library/user-event";

describe("User Registration Form", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should complete full user registration workflow", async () => {
    const onSubmit = createMockSubmit();
    const user = userEvent.setup();
    render(
      <Form
        initialValues={defaultUserValues}
        onSubmit={onSubmit}
        validators={userRegistrationValidators}
        validateOnBlur={true}
        validateOnSubmit={true}
      >
        <TextField name="firstName" label="First Name" />
        <TextField name="lastName" label="Last Name" />
        <TextField name="email" label="Email" />
        <NumberField name="age" label="Age" />
        <CheckboxField name="terms" label="I accept the terms and conditions" />
        <button type="submit">Register</button>
      </Form>,
    );

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const ageInput = screen.getByLabelText(/age/i);
    const termsCheckbox = screen.getByLabelText(/terms/i);
    const submitButton = screen.getByRole("button", { name: /register/i });

    await user.type(firstNameInput, "John");
    await user.type(lastNameInput, "Doe");
    await user.type(emailInput, "john.doe@example.com");
    await user.clear(ageInput);
    await user.type(ageInput, "25");
    await user.click(termsCheckbox);

    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        age: 25,
        terms: true,
      });
    });
  });

  it("should show validation errors and prevent submission", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <Form
        initialValues={defaultUserValues}
        onSubmit={onSubmit}
        validators={userRegistrationValidators}
        validateOnBlur={true}
        validateOnSubmit={true}
      >
        <TextField name="firstName" label="First Name" />
        <TextField name="lastName" label="Last Name" />
        <TextField name="email" label="Email" />
        <NumberField name="age" label="Age" />
        <CheckboxField name="terms" label="I accept the terms and conditions" />
        <button type="submit">Register</button>
      </Form>,
    );

    const firstNameInput = screen.getByLabelText(/first name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const ageInput = screen.getByLabelText(/age/i);
    const submitButton = screen.getByRole("button", { name: /register/i });

    await user.type(firstNameInput, "J");
    await user.tab();

    await user.type(emailInput, "invalid-email");
    await user.tab();

    await user.clear(ageInput);
    await user.type(ageInput, "16");
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText("First name must be at least 2 characters"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Please enter a valid email address"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("You must be at least 18 years old"),
      ).toBeInTheDocument();
    });

    await user.click(submitButton);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("should clear errors when valid input is provided", async () => {
    const user = userEvent.setup();
    render(
      <Form
        initialValues={defaultUserValues}
        onSubmit={vi.fn()}
        validators={userRegistrationValidators}
        validateOnChange={true}
        validateOnBlur={true}
      >
        <TextField name="firstName" label="First Name" />
        <TextField name="email" label="Email" />
      </Form>,
    );

    const firstNameInput = screen.getByLabelText(/first name/i);
    const emailInput = screen.getByLabelText(/email/i);

    await user.type(firstNameInput, "J");
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText("First name must be at least 2 characters"),
      ).toBeInTheDocument();
    });

    await user.click(firstNameInput);
    await user.type(firstNameInput, "ohn");

    await waitFor(() => {
      expect(
        screen.queryByText("First name must be at least 2 characters"),
      ).not.toBeInTheDocument();
    });

    await user.type(emailInput, "invalid");
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText("Please enter a valid email address"),
      ).toBeInTheDocument();
    });

    await user.click(emailInput);
    await user.clear(emailInput);
    await user.type(emailInput, "john@example.com");

    await waitFor(() => {
      expect(
        screen.queryByText("Please enter a valid email address"),
      ).not.toBeInTheDocument();
    });
  });
});
