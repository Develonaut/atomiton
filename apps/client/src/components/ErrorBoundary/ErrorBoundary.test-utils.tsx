import { Component, ReactNode } from "react";

/**
 * Test utility component that can throw errors on demand
 * Useful for testing ErrorBoundary behavior
 */
type ErrorTriggerProps = {
  shouldThrow?: boolean;
  errorMessage?: string;
  errorType?: "Error" | "TypeError" | "ReferenceError";
  children?: ReactNode;
  throwOnRender?: boolean;
  throwOnMount?: boolean;
  throwOnUpdate?: boolean;
};

export class ErrorTrigger extends Component<ErrorTriggerProps> {
  componentDidMount() {
    if (this.props.throwOnMount) {
      throw new Error(this.props.errorMessage || "Error in componentDidMount");
    }
  }

  componentDidUpdate() {
    if (this.props.throwOnUpdate) {
      throw new Error(this.props.errorMessage || "Error in componentDidUpdate");
    }
  }

  render() {
    if (this.props.throwOnRender || this.props.shouldThrow) {
      const ErrorClass = this.getErrorClass();
      throw new ErrorClass(this.props.errorMessage || "Test error in render");
    }

    return (
      this.props.children || <div data-testid="no-error">No error occurred</div>
    );
  }

  private getErrorClass() {
    switch (this.props.errorType) {
      case "TypeError":
        return TypeError;
      case "ReferenceError":
        return ReferenceError;
      default:
        return Error;
    }
  }
}

/**
 * Functional component that throws errors
 * Alternative to class component for simpler cases
 */
type FunctionalErrorTriggerProps = {
  shouldThrow?: boolean;
  errorMessage?: string;
  children?: ReactNode;
};

export function FunctionalErrorTrigger({
  shouldThrow = false,
  errorMessage = "Functional component error",
  children,
}: FunctionalErrorTriggerProps) {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }

  return (
    children || (
      <div data-testid="functional-no-error">
        Functional component rendered successfully
      </div>
    )
  );
}

/**
 * Async error trigger for testing promise rejections
 */
export function AsyncErrorTrigger({
  shouldThrow = false,
}: {
  shouldThrow?: boolean;
}) {
  if (shouldThrow) {
    // This will throw during the next tick, testing unhandled promise rejections
    Promise.reject(new Error("Unhandled promise rejection"));
  }

  return <div data-testid="async-no-error">Async component rendered</div>;
}

/**
 * Utility to simulate different error scenarios
 */
export const ErrorScenarios = {
  renderError: () => (
    <ErrorTrigger shouldThrow errorMessage="Render phase error" />
  ),

  mountError: () => (
    <ErrorTrigger throwOnMount errorMessage="Mount phase error" />
  ),

  updateError: (trigger: boolean) => (
    <ErrorTrigger
      key={trigger ? "update" : "initial"}
      throwOnUpdate={trigger}
      errorMessage="Update phase error"
    >
      <div>Component that will error on update</div>
    </ErrorTrigger>
  ),

  typeError: () => (
    <ErrorTrigger
      shouldThrow
      errorType="TypeError"
      errorMessage="This is not a function"
    />
  ),

  referenceError: () => (
    <ErrorTrigger
      shouldThrow
      errorType="ReferenceError"
      errorMessage="Variable is not defined"
    />
  ),

  deepNestedError: () => (
    <div>
      <div>
        <div>
          <div>
            <ErrorTrigger
              shouldThrow
              errorMessage="Deep nested component error"
            />
          </div>
        </div>
      </div>
    </div>
  ),
} as const;
