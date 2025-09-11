import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { z } from "zod";
import { Form } from "../../components/Form.js";
import { TextField } from "../../components/fields/TextField.js";
import { NumberField } from "../../components/fields/NumberField.js";
import { SelectField } from "../../components/fields/SelectField.js";
import { CheckboxField } from "../../components/fields/CheckboxField.js";
import { zodValidator } from "../../utils/zod.js";

describe("Form Workflow Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("User Registration Form", () => {
    const userSchema = z.object({
      firstName: z.string().min(2, "First name must be at least 2 characters"),
      lastName: z.string().min(2, "Last name must be at least 2 characters"),
      email: z.string().email("Please enter a valid email address"),
      age: z.number().min(18, "You must be at least 18 years old"),
      terms: z
        .boolean()
        .refine((val) => val === true, "You must accept the terms"),
    });

    const validators = {
      firstName: [zodValidator(userSchema.shape.firstName)],
      lastName: [zodValidator(userSchema.shape.lastName)],
      email: [zodValidator(userSchema.shape.email)],
      age: [zodValidator(userSchema.shape.age)],
      terms: [zodValidator(userSchema.shape.terms)],
    };

    it("should complete full user registration workflow", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue(undefined);

      render(
        <Form
          initialValues={{
            firstName: "",
            lastName: "",
            email: "",
            age: 0,
            terms: false,
          }}
          onSubmit={onSubmit}
          validators={validators}
          validateOnBlur={true}
          validateOnSubmit={true}
        >
          <TextField name="firstName" label="First Name" />
          <TextField name="lastName" label="Last Name" />
          <TextField name="email" label="Email" />
          <NumberField name="age" label="Age" />
          <CheckboxField
            name="terms"
            label="I accept the terms and conditions"
          />
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
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(
        <Form
          initialValues={{
            firstName: "",
            lastName: "",
            email: "",
            age: 0,
            terms: false,
          }}
          onSubmit={onSubmit}
          validators={validators}
          validateOnBlur={true}
          validateOnSubmit={true}
        >
          <TextField name="firstName" label="First Name" />
          <TextField name="lastName" label="Last Name" />
          <TextField name="email" label="Email" />
          <NumberField name="age" label="Age" />
          <CheckboxField
            name="terms"
            label="I accept the terms and conditions"
          />
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
          initialValues={{
            firstName: "",
            lastName: "",
            email: "",
            age: 0,
            terms: false,
          }}
          onSubmit={vi.fn()}
          validators={validators}
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

  describe("Multi-Step Form Workflow", () => {
    it("should handle multi-step form with state preservation", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue(undefined);

      function MultiStepForm() {
        const [step, setStep] = React.useState(1);

        return (
          <Form
            initialValues={{
              personalInfo: { name: "", email: "" },
              preferences: { newsletter: false, theme: "light" },
            }}
            onSubmit={onSubmit}
          >
            {({ state }) => (
              <>
                {step === 1 && (
                  <div>
                    <h2>Step 1: Personal Information</h2>
                    <TextField name="personalInfo.name" label="Name" />
                    <TextField name="personalInfo.email" label="Email" />
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={
                        !state.values.personalInfo?.name ||
                        !state.values.personalInfo?.email
                      }
                    >
                      Next
                    </button>
                  </div>
                )}
                {step === 2 && (
                  <div>
                    <h2>Step 2: Preferences</h2>
                    <CheckboxField
                      name="preferences.newsletter"
                      label="Subscribe to newsletter"
                    />
                    <SelectField
                      name="preferences.theme"
                      label="Theme"
                      options={[
                        { value: "light", label: "Light" },
                        { value: "dark", label: "Dark" },
                      ]}
                    />
                    <button type="button" onClick={() => setStep(1)}>
                      Back
                    </button>
                    <button type="submit">Complete</button>
                  </div>
                )}
              </>
            )}
          </Form>
        );
      }

      render(<MultiStepForm />);

      expect(
        screen.getByText("Step 1: Personal Information"),
      ).toBeInTheDocument();

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const nextButton = screen.getByRole("button", { name: /next/i });

      expect(nextButton).toBeDisabled();

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");

      await waitFor(() => {
        expect(nextButton).toBeEnabled();
      });
      await user.click(nextButton);

      expect(screen.getByText("Step 2: Preferences")).toBeInTheDocument();

      const newsletterCheckbox = screen.getByLabelText(/newsletter/i);
      const themeSelect = screen.getByLabelText(/theme/i);
      const backButton = screen.getByRole("button", { name: /back/i });
      const completeButton = screen.getByRole("button", { name: /complete/i });

      await user.click(newsletterCheckbox);
      await user.selectOptions(themeSelect, "dark");

      await user.click(backButton);

      expect(
        screen.getByText("Step 1: Personal Information"),
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();

      await user.click(nextButton);
      expect(screen.getByLabelText(/newsletter/i)).toBeChecked();
      expect(screen.getByDisplayValue("dark")).toBeInTheDocument();

      await user.click(completeButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          personalInfo: { name: "John Doe", email: "john@example.com" },
          preferences: { newsletter: true, theme: "dark" },
        });
      });
    });
  });

  describe("Dynamic Form Fields", () => {
    it("should handle adding and removing dynamic fields", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue(undefined);

      function DynamicForm() {
        const [contacts, setContacts] = React.useState([""]);

        const addContact = () => setContacts([...contacts, ""]);
        const removeContact = (index: number) =>
          setContacts(contacts.filter((_, i) => i !== index));

        const initialValues = {
          name: "",
          contacts: contacts.reduce(
            (acc, _, i) => {
              acc[`contact${i}`] = "";
              return acc;
            },
            {} as Record<string, string>,
          ),
        };

        return (
          <Form initialValues={initialValues} onSubmit={onSubmit}>
            <TextField name="name" label="Name" />

            {contacts.map((_, index) => (
              <div key={index}>
                <TextField
                  name={`contacts.contact${index}`}
                  label={`Contact ${index + 1}`}
                />
                {contacts.length > 1 && (
                  <button type="button" onClick={() => removeContact(index)}>
                    Remove Contact {index + 1}
                  </button>
                )}
              </div>
            ))}

            <button type="button" onClick={addContact}>
              Add Contact
            </button>
            <button type="submit">Submit</button>
          </Form>
        );
      }

      render(<DynamicForm />);

      const nameInput = screen.getByLabelText(/^name/i);
      const addButton = screen.getByRole("button", { name: /add contact/i });
      const submitButton = screen.getByRole("button", { name: /submit/i });

      await user.type(nameInput, "John Doe");

      const contact1Input = screen.getByLabelText(/contact 1/i);
      await user.type(contact1Input, "contact1@example.com");

      await user.click(addButton);

      const contact2Input = screen.getByLabelText(/contact 2/i);
      await user.type(contact2Input, "contact2@example.com");

      await user.click(addButton);

      const contact3Input = screen.getByLabelText(/contact 3/i);
      await user.type(contact3Input, "contact3@example.com");

      const removeButton = screen.getByRole("button", {
        name: /remove contact 2/i,
      });
      await user.click(removeButton);

      expect(screen.queryByLabelText(/contact 2/i)).not.toBeInTheDocument();
      expect(screen.getByLabelText(/contact 3/i)).toBeInTheDocument();

      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });
  });

  describe("Conditional Field Rendering", () => {
    it("should show/hide fields based on other field values", async () => {
      const user = userEvent.setup();

      render(
        <Form
          initialValues={{
            accountType: "personal",
            companyName: "",
            taxId: "",
            personalId: "",
          }}
          onSubmit={vi.fn()}
        >
          {({ state }) => (
            <>
              <SelectField
                name="accountType"
                label="Account Type"
                options={[
                  { value: "personal", label: "Personal" },
                  { value: "business", label: "Business" },
                ]}
              />

              {state.values.accountType === "business" && (
                <>
                  <TextField name="companyName" label="Company Name" />
                  <TextField name="taxId" label="Tax ID" />
                </>
              )}

              {state.values.accountType === "personal" && (
                <TextField name="personalId" label="Personal ID" />
              )}
            </>
          )}
        </Form>,
      );

      expect(screen.getByLabelText(/personal id/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/company name/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/tax id/i)).not.toBeInTheDocument();

      const accountTypeSelect = screen.getByLabelText(/account type/i);
      await user.selectOptions(accountTypeSelect, "business");

      expect(screen.queryByLabelText(/personal id/i)).not.toBeInTheDocument();
      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tax id/i)).toBeInTheDocument();

      await user.selectOptions(accountTypeSelect, "personal");

      expect(screen.getByLabelText(/personal id/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/company name/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/tax id/i)).not.toBeInTheDocument();
    });
  });

  describe("Form Reset and Clear", () => {
    it("should reset form to initial values", async () => {
      const user = userEvent.setup();

      render(
        <Form
          initialValues={{
            name: "Initial Name",
            email: "initial@example.com",
            subscribe: true,
          }}
          onSubmit={vi.fn()}
        >
          {({ helpers }) => (
            <>
              <TextField name="name" label="Name" />
              <TextField name="email" label="Email" />
              <CheckboxField name="subscribe" label="Subscribe" />
              <button type="button" onClick={() => helpers.reset()}>
                Reset
              </button>
            </>
          )}
        </Form>,
      );

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const subscribeCheckbox = screen.getByLabelText(/subscribe/i);
      const resetButton = screen.getByRole("button", { name: /reset/i });

      expect(nameInput).toHaveValue("Initial Name");
      expect(emailInput).toHaveValue("initial@example.com");
      expect(subscribeCheckbox).toBeChecked();

      await user.clear(nameInput);
      await user.type(nameInput, "Changed Name");
      await user.clear(emailInput);
      await user.type(emailInput, "changed@example.com");
      await user.click(subscribeCheckbox);

      expect(nameInput).toHaveValue("Changed Name");
      expect(emailInput).toHaveValue("changed@example.com");
      expect(subscribeCheckbox).not.toBeChecked();

      await user.click(resetButton);

      expect(nameInput).toHaveValue("Initial Name");
      expect(emailInput).toHaveValue("initial@example.com");
      expect(subscribeCheckbox).toBeChecked();
    });

    it("should reset with custom values", async () => {
      const user = userEvent.setup();

      render(
        <Form initialValues={{ name: "", email: "" }} onSubmit={vi.fn()}>
          {({ helpers }) => (
            <>
              <TextField name="name" label="Name" />
              <TextField name="email" label="Email" />
              <button
                type="button"
                onClick={() => helpers.reset({ name: "Custom Reset" })}
              >
                Custom Reset
              </button>
            </>
          )}
        </Form>,
      );

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const resetButton = screen.getByRole("button");

      await user.type(nameInput, "Original Name");
      await user.type(emailInput, "original@example.com");

      await user.click(resetButton);

      expect(nameInput).toHaveValue("Custom Reset");
      expect(emailInput).toHaveValue("");
    });
  });

  describe("Complex Validation Scenarios", () => {
    it("should handle cross-field validation", async () => {
      const user = userEvent.setup();

      const passwordValidator = (value: string, _values?: unknown) => ({
        valid: value.length >= 8,
        error: "Password must be at least 8 characters",
      });

      const confirmPasswordValidator = (
        value: string,
        values?: { password?: string },
      ) => ({
        valid: value === values?.password,
        error: "Passwords do not match",
      });

      const validators = {
        password: [passwordValidator],
        confirmPassword: [confirmPasswordValidator],
      };

      render(
        <Form
          initialValues={{ password: "", confirmPassword: "" }}
          onSubmit={vi.fn()}
          validators={validators}
          validateOnChange={true}
        >
          <TextField name="password" label="Password" type="password" />
          <TextField
            name="confirmPassword"
            label="Confirm Password"
            type="password"
          />
        </Form>,
      );

      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(passwordInput, "short");
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText("Password must be at least 8 characters"),
        ).toBeInTheDocument();
      });

      await user.clear(passwordInput);
      await user.type(passwordInput, "validpassword");

      await user.type(confirmPasswordInput, "differentpassword");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
      });

      await user.clear(confirmPasswordInput);
      await user.type(confirmPasswordInput, "validpassword");

      await waitFor(() => {
        expect(
          screen.queryByText("Passwords do not match"),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Performance with Large Forms", () => {
    it("should handle forms with many fields efficiently", async () => {
      const user = userEvent.setup();
      const fieldCount = 100;

      const initialValues = Object.fromEntries(
        Array.from({ length: fieldCount }, (_, i) => [`field${i}`, ""]),
      );

      const startTime = performance.now();

      render(
        <Form initialValues={initialValues} onSubmit={vi.fn()}>
          {({ state }) => (
            <>
              {Array.from({ length: Math.min(fieldCount, 10) }, (_, i) => (
                <TextField key={i} name={`field${i}`} label={`Field ${i}`} />
              ))}
              <div data-testid="field-count">
                {Object.keys(state.values).length}
              </div>
            </>
          )}
        </Form>,
      );

      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(100);

      const firstField = screen.getByLabelText(/field 0/i);
      const updateStartTime = performance.now();

      await user.type(firstField, "test value");

      const updateTime = performance.now() - updateStartTime;
      expect(updateTime).toBeLessThan(100);

      expect(screen.getByTestId("field-count")).toHaveTextContent(
        fieldCount.toString(),
      );
    });
  });
});
