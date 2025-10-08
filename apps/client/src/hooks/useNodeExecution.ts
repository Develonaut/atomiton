import conductor from "#lib/conductor";
import type {
  ConductorExecutionContext,
  ExecutionResult,
} from "@atomiton/conductor/browser";
import { ErrorCode } from "@atomiton/conductor/browser";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { useCallback, useRef, useState } from "react";

export type ExecutionOptions = Partial<ConductorExecutionContext>;

export type UseNodeExecutionOptions = {
  /** Whether to validate node before execution (default: true) */
  validateBeforeRun?: boolean;
  /** Callback fired when execution starts */
  onExecutionStart?: (node: NodeDefinition) => void;
  /** Callback fired when execution completes */
  onExecutionComplete?: (result: ExecutionResult) => void;
  /** Callback fired when validation fails */
  onValidationError?: (errors: string[]) => void;
};

export type UseNodeExecutionReturn = {
  /** Execute a node with optional execution context */
  execute: (
    node: NodeDefinition,
    executionOptions?: ExecutionOptions,
  ) => Promise<ExecutionResult>;
  /** Validate a node without executing */
  validate: (
    node: NodeDefinition,
  ) => Promise<{ valid: boolean; errors: string[] }>;
  /** Cancel current execution */
  cancel: () => Promise<void>;
  /** Reset execution state */
  reset: () => void;
  /** Whether execution is in progress */
  isExecuting: boolean;
  /** Latest execution result */
  result: ExecutionResult | null;
  /** Execution error (convenience accessor) */
  error: ExecutionResult["error"] | null;
  /** Execution success status (convenience accessor) */
  success: boolean;
};

/**
 * Shared hook for node/flow execution with validation
 *
 * Provides a consistent API for executing nodes across the application.
 * Used by both the editor toolbar and debug pages.
 *
 * @example
 * ```tsx
 * const { execute, isExecuting, result, error } = useNodeExecution({
 *   validateBeforeRun: true,
 *   onExecutionComplete: (result) => console.log('Done!', result)
 * });
 *
 * await execute(myNode, { slowMo: 100 });
 * ```
 */
export function useNodeExecution(
  options: UseNodeExecutionOptions = {},
): UseNodeExecutionReturn {
  const {
    validateBeforeRun = true,
    onExecutionStart,
    onExecutionComplete,
    onValidationError,
  } = options;

  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const currentExecutionIdRef = useRef<string | null>(null);

  const validate = useCallback(
    async (
      node: NodeDefinition,
    ): Promise<{ valid: boolean; errors: string[] }> => {
      const validationResult = await conductor.node.validate(node);
      if (!validationResult.valid && onValidationError) {
        onValidationError(validationResult.errors);
      }
      return validationResult;
    },
    [onValidationError],
  );

  const execute = useCallback(
    async (
      node: NodeDefinition,
      executionOptions?: ExecutionOptions,
    ): Promise<ExecutionResult> => {
      setIsExecuting(true);
      setResult(null);

      try {
        // Validate if requested
        if (validateBeforeRun) {
          const validationResult = await validate(node);
          if (!validationResult.valid) {
            const errorResult: ExecutionResult = {
              success: false,
              error: {
                code: ErrorCode.INVALID_NODE,
                nodeId: node.id,
                message: `Validation failed: ${validationResult.errors.join(", ")}`,
                timestamp: new Date(),
              },
            };
            setResult(errorResult);
            return errorResult;
          }
        }

        // Track execution
        currentExecutionIdRef.current = executionOptions?.executionId || null;

        // Fire start callback
        onExecutionStart?.(node);

        // Execute node
        const executionResult = await conductor.node.run(
          node,
          executionOptions,
        );

        setResult(executionResult);

        // Fire completion callback
        onExecutionComplete?.(executionResult);

        return executionResult;
      } catch (error) {
        const errorResult: ExecutionResult = {
          success: false,
          error: {
            code: ErrorCode.EXECUTION_FAILED,
            nodeId: node.id,
            message: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date(),
          },
        };
        setResult(errorResult);
        return errorResult;
      } finally {
        setIsExecuting(false);
        currentExecutionIdRef.current = null;
      }
    },
    [validateBeforeRun, validate, onExecutionStart, onExecutionComplete],
  );

  const cancel = useCallback(async () => {
    if (currentExecutionIdRef.current) {
      await conductor.node.cancel(currentExecutionIdRef.current);
      currentExecutionIdRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setIsExecuting(false);
    currentExecutionIdRef.current = null;
  }, []);

  return {
    /** Execute a node with optional execution context */
    execute,
    /** Validate a node without executing */
    validate,
    /** Cancel current execution */
    cancel,
    /** Reset execution state */
    reset,
    /** Whether execution is in progress */
    isExecuting,
    /** Latest execution result */
    result,
    /** Execution error (convenience accessor) */
    error: result?.error || null,
    /** Execution success status (convenience accessor) */
    success: result?.success || false,
  };
}
