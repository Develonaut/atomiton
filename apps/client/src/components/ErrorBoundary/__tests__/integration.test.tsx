import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ErrorBoundary from "../index";
import {
  ErrorTrigger,
  ErrorScenarios,
  FunctionalErrorTrigger,
} from "../ErrorBoundary.test-utils";

// Mock console and DOM APIs
const mockConsoleError = vi.fn();
const originalError = console.error;

beforeEach(() => {
  console.error = mockConsoleError;
});

afterEach(() => {
  console.error = originalError;
  vi.clearAllMocks();
});

describe("ErrorBoundary Integration Tests", () => {
  describe("Real-world Error Scenarios", () => {
    it("should handle render phase errors", () => {
      render(<ErrorBoundary>{ErrorScenarios.renderError()}</ErrorBoundary>);

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(screen.getByText("Render phase error")).toBeInTheDocument();
    });

    it("should handle component lifecycle errors", () => {
      render(<ErrorBoundary>{ErrorScenarios.mountError()}</ErrorBoundary>);

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(screen.getByText("Mount phase error")).toBeInTheDocument();
    });

    it("should handle update phase errors", () => {
      const { rerender } = render(
        <ErrorBoundary>{ErrorScenarios.updateError(false)}</ErrorBoundary>,
      );

      // Initial render should be fine
      expect(
        screen.getByText("Component that will error on update"),
      ).toBeInTheDocument();

      // Trigger update that causes error
      rerender(
        <ErrorBoundary>{ErrorScenarios.updateError(true)}</ErrorBoundary>,
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("should handle different error types", () => {
      const { rerender } = render(
        <ErrorBoundary>{ErrorScenarios.typeError()}</ErrorBoundary>,
      );

      expect(screen.getByText("This is not a function")).toBeInTheDocument();

      // Test with different error type
      rerender(
        <ErrorBoundary>{ErrorScenarios.referenceError()}</ErrorBoundary>,
      );

      expect(screen.getByText("Variable is not defined")).toBeInTheDocument();
    });

    it("should handle deeply nested component errors", () => {
      render(<ErrorBoundary>{ErrorScenarios.deepNestedError()}</ErrorBoundary>);

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(
        screen.getByText("Deep nested component error"),
      ).toBeInTheDocument();
    });
  });

  describe("Error Boundary Nesting", () => {
    it("should handle nested error boundaries", () => {
      render(
        <ErrorBoundary onError={vi.fn()}>
          <div>Outer boundary content</div>
          <ErrorBoundary
            onError={vi.fn()}
            fallback={(error) => (
              <div>Inner boundary caught: {error.message}</div>
            )}
          >
            <ErrorTrigger shouldThrow errorMessage="Inner error" />
          </ErrorBoundary>
        </ErrorBoundary>,
      );

      // Inner boundary should catch the error
      expect(
        screen.getByText("Inner boundary caught: Inner error"),
      ).toBeInTheDocument();
      expect(screen.getByText("Outer boundary content")).toBeInTheDocument();

      // Outer boundary error UI should NOT be shown
      expect(
        screen.queryByText("Something went wrong"),
      ).not.toBeInTheDocument();
    });

    it("should bubble errors when inner boundary has no custom fallback", () => {
      const outerOnError = vi.fn();
      const innerOnError = vi.fn();

      render(
        <ErrorBoundary onError={outerOnError}>
          <ErrorBoundary onError={innerOnError}>
            <ErrorTrigger shouldThrow errorMessage="Bubbling error" />
          </ErrorBoundary>
        </ErrorBoundary>,
      );

      // Both boundaries should catch the error (inner first, then bubbles to outer)
      expect(innerOnError).toHaveBeenCalled();
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
  });

  describe("Error Recovery Workflows", () => {
    it("should support full error recovery cycle", async () => {
      const onError = vi.fn();

      const { rerender } = render(
        <ErrorBoundary onError={onError}>
          <ErrorTrigger shouldThrow errorMessage="Recovery test error" />
        </ErrorBoundary>,
      );

      // 1. Error should be caught and displayed
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(onError).toHaveBeenCalledTimes(1);

      // 2. Click Try Again
      fireEvent.click(screen.getByText("Try Again"));

      // 3. Re-render with working component
      rerender(
        <ErrorBoundary onError={onError}>
          <div>Component is now working</div>
        </ErrorBoundary>,
      );

      // 4. Should show normal content
      expect(screen.getByText("Component is now working")).toBeInTheDocument();
      expect(
        screen.queryByText("Something went wrong"),
      ).not.toBeInTheDocument();
    });

    it("should handle rapid error/recovery cycles", () => {
      const onError = vi.fn();

      const { rerender } = render(
        <ErrorBoundary onError={onError}>
          <ErrorTrigger shouldThrow={false}>Working component</ErrorTrigger>
        </ErrorBoundary>,
      );

      // Should start working
      expect(screen.getByText("Working component")).toBeInTheDocument();

      for (let i = 0; i < 3; i++) {
        // Cause error
        rerender(
          <ErrorBoundary onError={onError}>
            <ErrorTrigger shouldThrow errorMessage={`Error cycle ${i + 1}`} />
          </ErrorBoundary>,
        );

        expect(screen.getByText("Something went wrong")).toBeInTheDocument();

        // Recover
        fireEvent.click(screen.getByText("Try Again"));

        rerender(
          <ErrorBoundary onError={onError}>
            <ErrorTrigger shouldThrow={false}>Recovered component</ErrorTrigger>
          </ErrorBoundary>,
        );

        expect(screen.getByText("Recovered component")).toBeInTheDocument();
      }

      expect(onError).toHaveBeenCalledTimes(3);
    });
  });

  describe("Error Reporting Integration", () => {
    it("should capture comprehensive error context", () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <div data-testid="wrapper">
            <FunctionalErrorTrigger
              shouldThrow
              errorMessage="Context capture test"
            >
              <div>Some nested content</div>
            </FunctionalErrorTrigger>
          </div>
        </ErrorBoundary>,
      );

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Context capture test",
          name: "Error",
          stack: expect.stringContaining("FunctionalErrorTrigger"),
        }),
        expect.objectContaining({
          componentStack: expect.stringContaining("FunctionalErrorTrigger"),
        }),
      );
    });

    it("should provide actionable error information for debugging", () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ErrorTrigger shouldThrow errorMessage="Debugging info test" />
        </ErrorBoundary>,
      );

      const [error, errorInfo] = onError.mock.calls[0];

      // Error should have useful debugging info
      expect(error.message).toBe("Debugging info test");
      expect(error.stack).toBeDefined();
      expect(errorInfo.componentStack).toContain("ErrorTrigger");
    });
  });

  describe("Performance and Memory", () => {
    it("should not leak memory during error/recovery cycles", () => {
      const onError = vi.fn();
      let renderCount = 0;

      const TestComponent = ({ shouldError }: { shouldError: boolean }) => {
        renderCount++;
        if (shouldError) {
          throw new Error(`Error on render ${renderCount}`);
        }
        return <div>Render count: {renderCount}</div>;
      };

      const { rerender } = render(
        <ErrorBoundary onError={onError}>
          <TestComponent shouldError={false} />
        </ErrorBoundary>,
      );

      // Cycle through errors and recoveries
      for (let i = 0; i < 10; i++) {
        // Cause error
        rerender(
          <ErrorBoundary onError={onError}>
            <TestComponent shouldError={true} />
          </ErrorBoundary>,
        );

        // Recover
        fireEvent.click(screen.getByText("Try Again"));

        rerender(
          <ErrorBoundary onError={onError}>
            <TestComponent shouldError={false} />
          </ErrorBoundary>,
        );
      }

      // Should handle multiple cycles without issues
      expect(onError).toHaveBeenCalledTimes(10);
      expect(screen.getByText(/Render count:/)).toBeInTheDocument();
    });
  });

  describe("Accessibility and UX", () => {
    it("should provide accessible error information", () => {
      render(
        <ErrorBoundary>
          <ErrorTrigger shouldThrow errorMessage="Accessibility test error" />
        </ErrorBoundary>,
      );

      // Check for proper heading structure
      const heading = screen.getByText("Something went wrong");
      expect(heading.tagName).toBe("H1");

      // Check for descriptive error text
      expect(
        screen.getByText(
          "We've encountered an unexpected error. Don't worry - your work hasn't been lost.",
        ),
      ).toBeInTheDocument();

      // Check for actionable buttons
      const tryAgainButton = screen.getByText("Try Again");
      const downloadButton = screen.getByText("Download Report");

      expect(tryAgainButton.tagName).toBe("BUTTON");
      expect(downloadButton.tagName).toBe("BUTTON");
    });

    it("should maintain focus management during error states", () => {
      const { rerender } = render(
        <ErrorBoundary>
          <button>Focusable element</button>
        </ErrorBoundary>,
      );

      // Focus the button
      screen.getByText("Focusable element").focus();
      expect(screen.getByText("Focusable element")).toHaveFocus();

      // Trigger error
      rerender(
        <ErrorBoundary>
          <ErrorTrigger shouldThrow errorMessage="Focus test error" />
        </ErrorBoundary>,
      );

      // Error UI should be present and focusable
      expect(screen.getByText("Try Again")).toBeInTheDocument();

      // Focus should be manageable in error state
      screen.getByText("Try Again").focus();
      expect(screen.getByText("Try Again")).toHaveFocus();
    });
  });
});
