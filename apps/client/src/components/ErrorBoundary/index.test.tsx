import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Component } from "react";
import ErrorBoundary from "./index";

// Mock console methods to test logging
const originalError = console.error;
const mockConsoleError = vi.fn();

// Test component that throws an error when shouldThrow is true
type ThrowErrorProps = {
  shouldThrow?: boolean;
  errorMessage?: string;
};

function ThrowError({
  shouldThrow = false,
  errorMessage = "Test error",
}: ThrowErrorProps) {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>No Error</div>;
}

// Helper to create downloadable content and verify it
const createMockURL = vi.fn();
const revokeMockURL = vi.fn();
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();

beforeEach(() => {
  // Mock console.error
  console.error = mockConsoleError;

  // Mock URL methods
  Object.defineProperty(global, "URL", {
    value: {
      createObjectURL: createMockURL,
      revokeObjectURL: revokeMockURL,
    },
    writable: true,
  });

  // Mock document methods
  const mockLink = {
    href: "",
    download: "",
    click: mockClick,
  };

  Object.defineProperty(document, "createElement", {
    value: mockCreateElement.mockReturnValue(mockLink),
    writable: true,
  });

  Object.defineProperty(document.body, "appendChild", {
    value: mockAppendChild,
    writable: true,
  });

  Object.defineProperty(document.body, "removeChild", {
    value: mockRemoveChild,
    writable: true,
  });

  createMockURL.mockReturnValue("blob:mock-url");
});

afterEach(() => {
  console.error = originalError;
  vi.clearAllMocks();
});

describe("ErrorBoundary", () => {
  describe("Normal Operation", () => {
    it("should render children when no error occurs", () => {
      render(
        <ErrorBoundary>
          <div>Child Component</div>
        </ErrorBoundary>,
      );

      expect(screen.getByText("Child Component")).toBeInTheDocument();
    });

    it("should not log any errors when functioning normally", () => {
      render(
        <ErrorBoundary>
          <div>Normal content</div>
        </ErrorBoundary>,
      );

      expect(mockConsoleError).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should catch and display errors from child components", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow errorMessage="Component crashed!" />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(screen.getByText("Component crashed!")).toBeInTheDocument();
      expect(screen.getByText("Try Again")).toBeInTheDocument();
      expect(screen.getByText("Download Report")).toBeInTheDocument();
    });

    it("should log errors to console", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow errorMessage="Console test error" />
        </ErrorBoundary>,
      );

      expect(mockConsoleError).toHaveBeenCalledWith(
        "ErrorBoundary caught an error:",
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        }),
      );
    });

    it("should call onError callback when provided", () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow errorMessage="Callback test error" />
        </ErrorBoundary>,
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        }),
      );
    });
  });

  describe("Error Recovery", () => {
    it("should recover from error when Try Again is clicked", () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow errorMessage="Recoverable error" />
        </ErrorBoundary>,
      );

      // Error should be displayed
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();

      // Click Try Again
      fireEvent.click(screen.getByText("Try Again"));

      // Re-render with no error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>,
      );

      // Should show normal content
      expect(screen.getByText("No Error")).toBeInTheDocument();
      expect(
        screen.queryByText("Something went wrong"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Error Reporting", () => {
    it("should generate and download error report when Download Report is clicked", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow errorMessage="Report test error" />
        </ErrorBoundary>,
      );

      // Click Download Report
      fireEvent.click(screen.getByText("Download Report"));

      // Verify report generation process
      expect(createMockURL).toHaveBeenCalledWith(expect.any(Blob));
      expect(mockCreateElement).toHaveBeenCalledWith("a");
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(revokeMockURL).toHaveBeenCalledWith("blob:mock-url");
    });

    it("should include comprehensive error information in report", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow errorMessage="Comprehensive error test" />
        </ErrorBoundary>,
      );

      fireEvent.click(screen.getByText("Download Report"));

      // Get the blob data that was created
      const [[blob]] = createMockURL.mock.calls;
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe("application/json");

      // Verify the report contains expected fields
      const reader = new FileReader();
      reader.onload = () => {
        const report = JSON.parse(reader.result as string);
        expect(report).toEqual({
          timestamp: expect.any(String),
          userAgent: expect.any(String),
          url: expect.any(String),
          error: {
            name: "Error",
            message: "Comprehensive error test",
            stack: expect.any(String),
          },
          errorInfo: {
            componentStack: expect.any(String),
          },
        });
      };
      reader.readAsText(blob);
    });

    it("should handle missing error info gracefully", () => {
      // Create ErrorBoundary with manually triggered error state
      class TestErrorBoundary extends ErrorBoundary {
        constructor(props: any) {
          super(props);
          // Set incomplete error state
          this.state = {
            hasError: true,
            error: new Error("Test error"),
            errorInfo: null,
          };
        }
      }

      render(
        <TestErrorBoundary>
          <div>Should not render</div>
        </TestErrorBoundary>,
      );

      // Should still render error UI but Download Report shouldn't work
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();

      // Clicking Download Report should not crash
      fireEvent.click(screen.getByText("Download Report"));
      expect(createMockURL).not.toHaveBeenCalled();
    });
  });

  describe("Custom Fallback", () => {
    it("should use custom fallback when provided", () => {
      const customFallback = (error: Error) => (
        <div>
          <h1>Custom Error UI</h1>
          <p>Error: {error.message}</p>
        </div>
      );

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow errorMessage="Custom fallback test" />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Custom Error UI")).toBeInTheDocument();
      expect(
        screen.getByText("Error: Custom fallback test"),
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Something went wrong"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle multiple consecutive errors", () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow errorMessage="First error" />
        </ErrorBoundary>,
      );

      expect(screen.getByText("First error")).toBeInTheDocument();

      // Trigger retry
      fireEvent.click(screen.getByText("Try Again"));

      // Cause another error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow errorMessage="Second error" />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Second error")).toBeInTheDocument();
    });

    it("should handle errors without error info", () => {
      // This tests the componentDidCatch error handling
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow errorMessage="No info error" />
        </ErrorBoundary>,
      );

      // Should still display error UI
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(screen.getByText("No info error")).toBeInTheDocument();
    });
  });

  describe("Component Lifecycle", () => {
    it("should properly initialize state", () => {
      const wrapper = render(
        <ErrorBoundary>
          <div>Test</div>
        </ErrorBoundary>,
      );

      // Access the ErrorBoundary instance to check initial state
      const errorBoundary = wrapper.container.querySelector(
        ".error-boundary-root",
      );
      expect(screen.getByText("Test")).toBeInTheDocument();
    });

    it("should handle unmounting gracefully", () => {
      const { unmount } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow errorMessage="Unmount test" />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });
  });
});
