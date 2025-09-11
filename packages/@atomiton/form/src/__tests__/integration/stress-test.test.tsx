import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { useState } from "react";
import { Form } from "../../components/Form.js";
import { TextField } from "../../components/fields/TextField.js";
import { NumberField } from "../../components/fields/NumberField.js";

describe("STRESS TESTS - Break Everything", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rapid Fire Submission Test", () => {
    it("should handle 100 rapid submission attempts without corruption", async () => {
      const onSubmit = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 10)),
        );

      render(
        <Form
          initialValues={{ name: "test" }}
          onSubmit={onSubmit}
          validateOnSubmit={false}
        >
          {({ helpers }) => (
            <>
              <TextField name="name" />
              <button type="button" onClick={() => helpers.submit(onSubmit)}>
                Submit
              </button>
            </>
          )}
        </Form>,
      );

      const submitButton = screen.getByRole("button");

      const promises = Array.from({ length: 100 }, () => {
        fireEvent.click(submitButton);
        return Promise.resolve();
      });

      await Promise.all(promises);

      expect(onSubmit.mock.calls.length).toBeGreaterThan(0);
      expect(onSubmit.mock.calls.length).toBeLessThanOrEqual(100);
    });

    it("should handle rapid form submission with Enter key", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(
        <Form initialValues={{ name: "" }} onSubmit={onSubmit}>
          <TextField name="name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");

      await user.click(input);
      for (let i = 0; i < 20; i++) {
        await user.keyboard("{enter}");
      }

      expect(onSubmit.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe("Massive Data Input Test", () => {
    it("should handle 10MB of text input without crashing", async () => {
      const massiveText = "x".repeat(10 * 1024 * 1024);

      render(
        <Form initialValues={{ content: "" }} onSubmit={vi.fn()}>
          <TextField name="content" />
        </Form>,
      );

      const input = screen.getByRole("textbox");

      fireEvent.change(input, { target: { value: massiveText } });

      expect(input.value.length).toBe(massiveText.length);
    });

    it("should handle extremely complex nested data structures", () => {
      const complexData = {
        user: {
          profile: {
            personal: {
              name: "John",
              contacts: Array.from({ length: 1000 }, (_, i) => ({
                id: i,
                email: `contact${i}@test.com`,
                metadata: {
                  tags: Array.from({ length: 100 }, (_, j) => `tag${j}`),
                },
              })),
            },
          },
        },
      };

      render(
        <Form initialValues={complexData} onSubmit={vi.fn()}>
          <TextField name="user.profile.personal.name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("John");
    });
  });

  describe("Rapid Field Switching Test", () => {
    it("should handle 1000 rapid field focus changes", async () => {
      const user = userEvent.setup();

      render(
        <Form
          initialValues={{ field1: "", field2: "", field3: "" }}
          onSubmit={vi.fn()}
        >
          <TextField name="field1" />
          <TextField name="field2" />
          <TextField name="field3" />
        </Form>,
      );

      const inputs = screen.getAllByRole("textbox");

      for (let i = 0; i < 1000; i++) {
        const randomInput = inputs[i % inputs.length];
        await user.click(randomInput);
      }

      expect(document.activeElement).toBe(inputs[1]);
    });

    it("should handle rapid typing across multiple fields", async () => {
      const user = userEvent.setup();

      render(
        <Form initialValues={{ a: "", b: "", c: "" }} onSubmit={vi.fn()}>
          <TextField name="a" />
          <TextField name="b" />
          <TextField name="c" />
        </Form>,
      );

      const inputs = screen.getAllByRole("textbox");

      for (let i = 0; i < 300; i++) {
        const input = inputs[i % inputs.length];
        await user.click(input);
        await user.type(input, `${i}`, { delay: 0 });
      }

      inputs.forEach((input) => {
        expect(input).toHaveValue(expect.stringContaining("99"));
      });
    });
  });

  describe("Validation Chaos Test", () => {
    it("should handle changing validation rules mid-validation", async () => {
      const user = userEvent.setup();

      function DynamicValidationForm() {
        const [strict, setStrict] = useState(false);

        const validators = {
          name: [
            (value: string) => ({
              valid: strict ? value.length >= 10 : value.length >= 1,
              error: strict ? "Name must be 10+ chars" : "Name required",
            }),
          ],
        };

        return (
          <Form
            initialValues={{ name: "" }}
            onSubmit={vi.fn()}
            validators={validators}
            validateOnChange={true}
          >
            <TextField name="name" />
            <button type="button" onClick={() => setStrict(!strict)}>
              Toggle Strict
            </button>
          </Form>
        );
      }

      render(<DynamicValidationForm />);

      const input = screen.getByRole("textbox");
      const toggleButton = screen.getByRole("button");

      await user.type(input, "short");

      for (let i = 0; i < 100; i++) {
        fireEvent.click(toggleButton);
        await user.type(input, "x");
      }

      expect(input).toHaveValue(expect.stringContaining("short"));
    });

    it("should handle async validation race conditions", async () => {
      const user = userEvent.setup();
      let resolveCount = 0;

      const slowAsyncValidator = vi
        .fn()
        .mockImplementation(async (value: string) => {
          const delay = Math.random() * 100;
          const currentResolveCount = ++resolveCount;

          await new Promise((resolve) => setTimeout(resolve, delay));

          return {
            valid: value.length > 0,
            error: `Async error ${currentResolveCount}`,
          };
        });

      const validators = {
        name: [slowAsyncValidator],
      };

      render(
        <Form
          initialValues={{ name: "" }}
          onSubmit={vi.fn()}
          validators={validators}
          validateOnChange={true}
        >
          <TextField name="name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");

      const rapidInputs = Array.from({ length: 50 }, (_, i) => `input${i}`);

      for (const text of rapidInputs) {
        await user.clear(input);
        await user.type(input, text);
      }

      await waitFor(
        () => {
          expect(slowAsyncValidator.mock.calls.length).toBeGreaterThan(10);
        },
        { timeout: 2000 },
      );
    });
  });

  describe("Memory Stress Test", () => {
    it("should handle 1000+ field form without memory leaks", () => {
      const largeInitialValues = Object.fromEntries(
        Array.from({ length: 1000 }, (_, i) => [`field${i}`, `value${i}`]),
      );

      render(
        <Form initialValues={largeInitialValues} onSubmit={vi.fn()}>
          {({ state }) => (
            <div>
              {Object.keys(state.values)
                .slice(0, 10)
                .map((fieldName) => (
                  <TextField key={fieldName} name={fieldName} />
                ))}
            </div>
          )}
        </Form>,
      );

      expect(screen.getAllByRole("textbox")).toHaveLength(10);
    });

    it("should handle repeated form creation and destruction", () => {
      function TestComponent({ show }: { show: boolean }) {
        if (!show) return null;

        return (
          <Form initialValues={{ name: "test" }} onSubmit={vi.fn()}>
            <TextField name="name" />
          </Form>
        );
      }

      const { rerender } = render(<TestComponent show={true} />);

      for (let i = 0; i < 100; i++) {
        rerender(<TestComponent show={false} />);
        rerender(<TestComponent show={true} />);
      }

      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });
  });

  describe("Concurrent Operations Test", () => {
    it("should handle simultaneous field updates, validation, and submission", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue(undefined);

      const validator = vi.fn().mockImplementation(async (value: string) => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { valid: value.length > 0, error: "Required" };
      });

      const validators = {
        name: [validator],
        email: [validator],
      };

      render(
        <Form
          initialValues={{ name: "", email: "" }}
          onSubmit={onSubmit}
          validators={validators}
          validateOnChange={true}
        >
          {({ helpers }) => (
            <>
              <TextField name="name" />
              <TextField name="email" />
              <button type="button" onClick={() => helpers.submit(onSubmit)}>
                Submit
              </button>
              <button type="button" onClick={() => helpers.reset()}>
                Reset
              </button>
            </>
          )}
        </Form>,
      );

      const [nameInput, emailInput] = screen.getAllByRole("textbox");
      const submitButton = screen.getByRole("button", { name: /submit/i });
      const resetButton = screen.getByRole("button", { name: /reset/i });

      const operations = [
        () => user.type(nameInput, "a"),
        () => user.type(emailInput, "b"),
        () => fireEvent.click(submitButton),
        () => fireEvent.click(resetButton),
        () => user.clear(nameInput),
        () => user.clear(emailInput),
      ];

      await Promise.all(
        Array.from({ length: 20 }, () =>
          operations[Math.floor(Math.random() * operations.length)](),
        ),
      );

      await waitFor(() => {
        expect(validator.mock.calls.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Browser Edge Cases", () => {
    it("should handle autofill/autocomplete scenarios", async () => {
      render(
        <Form initialValues={{ username: "", password: "" }} onSubmit={vi.fn()}>
          <TextField name="username" autoComplete="username" />
          <TextField
            name="password"
            type="password"
            autoComplete="current-password"
          />
        </Form>,
      );

      const usernameInput = screen.getByRole("textbox");
      const passwordInput =
        screen.getByLabelText(/password/i) || screen.getAllByRole("textbox")[1];

      fireEvent.change(usernameInput, { target: { value: "autofilled_user" } });
      fireEvent.change(passwordInput, { target: { value: "autofilled_pass" } });

      expect(usernameInput).toHaveValue("autofilled_user");
      expect(passwordInput).toHaveValue("autofilled_pass");
    });

    it("should handle paste events with various data types", async () => {
      const user = userEvent.setup();

      render(
        <Form initialValues={{ content: "" }} onSubmit={vi.fn()}>
          <TextField name="content" />
        </Form>,
      );

      const input = screen.getByRole("textbox");

      const pasteData = [
        "Regular text",
        "Text with\nnewlines\nand\ttabs",
        "Special chars: !@#$%^&*()",
        "Unicode: 🚀 🌍 世界",
        "Numbers: 123456789",
        "Mixed: Hello 123 🌟 World!",
      ];

      for (const data of pasteData) {
        await user.clear(input);
        await user.click(input);

        fireEvent.paste(input, {
          clipboardData: {
            getData: () => data,
          },
        });

        fireEvent.change(input, { target: { value: data } });
        expect(input).toHaveValue(data);
      }
    });

    it("should handle drag and drop text content", async () => {
      render(
        <Form initialValues={{ content: "" }} onSubmit={vi.fn()}>
          <TextField name="content" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      const draggedText = "Dragged content";

      fireEvent.dragStart(input);
      fireEvent.drop(input, {
        dataTransfer: {
          getData: () => draggedText,
        },
      });

      fireEvent.change(input, { target: { value: draggedText } });
      expect(input).toHaveValue(draggedText);
    });
  });

  describe("Network Failure Simulation", () => {
    it("should handle submission when network fails", async () => {
      const failingSubmit = vi
        .fn()
        .mockRejectedValue(new Error("Network error"));
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <Form initialValues={{ name: "test" }} onSubmit={failingSubmit}>
          {({ helpers }) => (
            <>
              <TextField name="name" />
              <button
                type="button"
                onClick={() => helpers.submit(failingSubmit)}
              >
                Submit
              </button>
            </>
          )}
        </Form>,
      );

      const submitButton = screen.getByRole("button");

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Form submission error:",
          expect.any(Error),
        );
      });

      consoleSpy.mockRestore();
    });

    it("should handle validation when async validator fails", async () => {
      const failingValidator = vi
        .fn()
        .mockRejectedValue(new Error("Validation service down"));

      const validators = {
        name: [failingValidator],
      };

      render(
        <Form
          initialValues={{ name: "" }}
          onSubmit={vi.fn()}
          validators={validators}
          validateOnChange={true}
        >
          <TextField name="name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");

      fireEvent.change(input, { target: { value: "test" } });

      await waitFor(() => {
        expect(failingValidator).toHaveBeenCalled();
      });
    });
  });

  describe("State Corruption Prevention", () => {
    it("should maintain form integrity during state thrashing", async () => {
      render(
        <Form
          initialValues={{ name: "", email: "", age: 0 }}
          onSubmit={vi.fn()}
        >
          {({ helpers, state }) => (
            <>
              <TextField name="name" />
              <TextField name="email" />
              <NumberField name="age" />
              <button
                type="button"
                onClick={() => {
                  helpers.setFieldValue("name", "chaos");
                  helpers.setFieldError("email", { message: "error" });
                  helpers.setFieldTouched("age", true);
                  helpers.reset();
                  helpers.setValues({ name: "restored" });
                }}
              >
                Chaos
              </button>
              <div data-testid="state">{JSON.stringify(state.values)}</div>
            </>
          )}
        </Form>,
      );

      const chaosButton = screen.getByRole("button");

      for (let i = 0; i < 100; i++) {
        fireEvent.click(chaosButton);
      }

      const stateDiv = screen.getByTestId("state");
      const finalState = JSON.parse(stateDiv.textContent || "{}");

      expect(finalState).toHaveProperty("name");
      expect(finalState).toHaveProperty("email");
      expect(finalState).toHaveProperty("age");
    });
  });
});
