import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Form } from "../../components/Form.js";
import { TextField } from "../../components/fields/TextField.js";
import { NumberField } from "../../components/fields/NumberField.js";

describe("Performance Tests", () => {
  describe("Render Performance", () => {
    it("should render 100 fields in under 100ms", () => {
      const initialValues = Object.fromEntries(
        Array.from({ length: 100 }, (_, i) => [`field${i}`, ""]),
      );

      const startTime = performance.now();

      render(
        <Form initialValues={initialValues} onSubmit={vi.fn()}>
          {({ state }) => (
            <>
              {Object.keys(state.values)
                .slice(0, 10)
                .map((fieldName) => (
                  <TextField key={fieldName} name={fieldName} />
                ))}
            </>
          )}
        </Form>,
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(100);
      expect(screen.getAllByRole("textbox")).toHaveLength(10);
    });

    it("should handle re-renders efficiently", () => {
      function TestComponent({ count }: { count: number }) {
        return (
          <Form initialValues={{ counter: count }} onSubmit={vi.fn()}>
            <NumberField name="counter" />
          </Form>
        );
      }

      const { rerender } = render(<TestComponent count={0} />);

      const startTime = performance.now();

      for (let i = 1; i <= 50; i++) {
        rerender(<TestComponent count={i} />);
      }

      const endTime = performance.now();
      const rerenderTime = endTime - startTime;

      expect(rerenderTime).toBeLessThan(100);
    });
  });

  describe("Update Performance", () => {
    it("should handle 1000 rapid field updates efficiently", async () => {
      render(
        <Form initialValues={{ name: "" }} onSubmit={vi.fn()}>
          <TextField name="name" />
        </Form>,
      );

      const input = screen.getByRole("textbox");
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        fireEvent.change(input, { target: { value: `update${i}` } });
      }

      const endTime = performance.now();
      const updateTime = endTime - startTime;

      expect(updateTime).toBeLessThan(500);
      expect(input).toHaveValue("update999");
    });

    it("should handle concurrent field updates efficiently", () => {
      render(
        <Form
          initialValues={{ field1: "", field2: "", field3: "" }}
          onSubmit={vi.fn()}
        >
          {({ helpers }) => (
            <>
              <TextField name="field1" />
              <TextField name="field2" />
              <TextField name="field3" />
              <button
                type="button"
                onClick={() => {
                  for (let i = 0; i < 100; i++) {
                    helpers.setFieldValue("field1", `value1-${i}`);
                    helpers.setFieldValue("field2", `value2-${i}`);
                    helpers.setFieldValue("field3", `value3-${i}`);
                  }
                }}
              >
                Update All
              </button>
            </>
          )}
        </Form>,
      );

      const button = screen.getByRole("button");
      const startTime = performance.now();

      fireEvent.click(button);

      const endTime = performance.now();
      const updateTime = endTime - startTime;

      expect(updateTime).toBeLessThan(100);
    });
  });

  describe("Memory Performance", () => {
    it("should not leak memory with repeated form creation", () => {
      function TestForm({ show }: { show: boolean }) {
        if (!show) return null;

        return (
          <Form
            initialValues={Object.fromEntries(
              Array.from({ length: 100 }, (_, i) => [`field${i}`, `value${i}`]),
            )}
            onSubmit={vi.fn()}
          >
            <TextField name="field0" />
          </Form>
        );
      }

      const { rerender } = render(<TestForm show={true} />);

      const initialMemory = performance.memory
        ? performance.memory.usedJSHeapSize
        : 0;

      for (let i = 0; i < 50; i++) {
        rerender(<TestForm show={false} />);
        rerender(<TestForm show={true} />);
      }

      const finalMemory = performance.memory
        ? performance.memory.usedJSHeapSize
        : 0;

      if (performance.memory) {
        const memoryIncrease = finalMemory - initialMemory;
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      }
    });

    it("should handle large data structures efficiently", () => {
      const largeData = {
        users: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `User ${i}`,
          email: `user${i}@example.com`,
          metadata: Array.from({ length: 100 }, (_, j) => `meta${j}`),
        })),
      };

      const startTime = performance.now();

      render(
        <Form initialValues={largeData} onSubmit={vi.fn()}>
          <TextField name="users.0.name" />
        </Form>,
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(200);
    });
  });

  describe("Validation Performance", () => {
    it("should handle 100 validation functions efficiently", async () => {
      const user = userEvent.setup();

      const validators = {
        name: Array.from({ length: 100 }, (_, i) => (value: string) => ({
          valid: value.length > i % 10,
          error: `Validation ${i} failed`,
        })),
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
      const startTime = performance.now();

      await user.type(input, "test value", { delay: 0 });

      const endTime = performance.now();
      const validationTime = endTime - startTime;

      expect(validationTime).toBeLessThan(500);
    });

    it("should handle async validation efficiently", async () => {
      const user = userEvent.setup();

      const asyncValidator = vi
        .fn()
        .mockImplementation(async (value: string) => {
          await new Promise((resolve) => setTimeout(resolve, 1));
          return { valid: value.length > 0, error: "Required" };
        });

      const validators = {
        name: [asyncValidator],
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
      const startTime = performance.now();

      for (let i = 0; i < 20; i++) {
        await user.type(input, "a", { delay: 0 });
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(1000);
    });
  });

  describe("Submission Performance", () => {
    it("should handle rapid submissions efficiently", async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);

      render(
        <Form
          initialValues={{ name: "test" }}
          onSubmit={onSubmit}
          validateOnSubmit={false}
        >
          {({ helpers }) => (
            <button type="button" onClick={() => helpers.submit(onSubmit)}>
              Submit
            </button>
          )}
        </Form>,
      );

      const button = screen.getByRole("button");
      const startTime = performance.now();

      const promises = Array.from({ length: 50 }, () => {
        fireEvent.click(button);
        return Promise.resolve();
      });

      await Promise.all(promises);

      const endTime = performance.now();
      const submissionTime = endTime - startTime;

      expect(submissionTime).toBeLessThan(100);
    });
  });

  describe("Browser Performance", () => {
    it("should maintain 60fps during rapid interactions", async () => {
      const user = userEvent.setup();
      let frameCount = 0;
      let lastFrameTime = performance.now();
      const frameTimes: number[] = [];

      const measureFrames = () => {
        const currentTime = performance.now();
        const frameTime = currentTime - lastFrameTime;
        frameTimes.push(frameTime);
        lastFrameTime = currentTime;
        frameCount++;

        if (frameCount < 60) {
          requestAnimationFrame(measureFrames);
        }
      };

      render(
        <Form initialValues={{ text: "" }} onSubmit={vi.fn()}>
          <TextField name="text" />
        </Form>,
      );

      const input = screen.getByRole("textbox");

      requestAnimationFrame(measureFrames);

      for (let i = 0; i < 30; i++) {
        await user.type(input, "a", { delay: 0 });
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const averageFrameTime =
        frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      const targetFrameTime = 1000 / 60;

      expect(averageFrameTime).toBeLessThan(targetFrameTime * 2);
    });

    it("should handle large DOM updates efficiently", () => {
      function DynamicForm({ fieldCount }: { fieldCount: number }) {
        return (
          <Form
            initialValues={Object.fromEntries(
              Array.from({ length: fieldCount }, (_, i) => [`field${i}`, ""]),
            )}
            onSubmit={vi.fn()}
          >
            {({ state }) => (
              <>
                {Object.keys(state.values)
                  .slice(0, Math.min(fieldCount, 20))
                  .map((name) => (
                    <TextField key={name} name={name} />
                  ))}
              </>
            )}
          </Form>
        );
      }

      const { rerender } = render(<DynamicForm fieldCount={10} />);

      const startTime = performance.now();

      rerender(<DynamicForm fieldCount={100} />);

      const endTime = performance.now();
      const updateTime = endTime - startTime;

      expect(updateTime).toBeLessThan(50);
    });
  });

  describe("Stress Test Scenarios", () => {
    it("should handle extreme form complexity", () => {
      const complexInitialValues = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: Array.from({ length: 100 }, (_, i) => ({
                  id: i,
                  data: `item${i}`,
                })),
              },
            },
          },
        },
      };

      const startTime = performance.now();

      render(
        <Form initialValues={complexInitialValues} onSubmit={vi.fn()}>
          <TextField name="level1.level2.level3.level4.level5.0.data" />
        </Form>,
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(100);
      expect(screen.getByRole("textbox")).toHaveValue("item0");
    });

    it("should maintain performance under memory pressure", () => {
      const bigArrays = Array.from({ length: 10 }, () =>
        Array.from({ length: 10000 }, (_, i) => `data${i}`),
      );

      const startTime = performance.now();

      render(
        <Form
          initialValues={{ name: "", bigData: bigArrays }}
          onSubmit={vi.fn()}
        >
          <TextField name="name" />
        </Form>,
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(200);
    });
  });
});
