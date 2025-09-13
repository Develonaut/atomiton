import type { NodeExecutionContext, NodeExecutionResult } from "../types.js";

export abstract class NodeLogic<TConfig = Record<string, unknown>> {
  // Store context for use in result creation
  protected context?: NodeExecutionContext;

  abstract execute(
    context: NodeExecutionContext,
    config: TConfig,
  ): Promise<NodeExecutionResult>;

  getDefaultConfig(): Partial<TConfig> {
    return {};
  }

  validateConfig(config: unknown): config is TConfig {
    return typeof config === "object" && config !== null;
  }

  validateInputs(_inputs: Record<string, unknown>): boolean {
    return true;
  }

  getValidatedConfig(context?: NodeExecutionContext): TConfig {
    const config = context?.config as TConfig;
    if (this.validateConfig(config)) {
      return config;
    }
    return this.getDefaultConfig() as TConfig;
  }

  protected getInput<T = unknown>(
    context: NodeExecutionContext,
    portId: string,
    defaultValue?: T,
  ): T | undefined {
    const value = context.inputs?.[portId];
    return value !== undefined ? (value as T) : (defaultValue ?? undefined);
  }

  protected getConfigValue<T = unknown>(
    config: TConfig,
    key: keyof TConfig,
    defaultValue?: T,
  ): T {
    const value = config?.[key];
    return value !== undefined ? (value as T) : (defaultValue as T);
  }

  protected shouldAbort(context: NodeExecutionContext): boolean {
    const elapsed = Date.now() - context.startTime.getTime();
    return elapsed > context.limits.maxExecutionTimeMs;
  }

  protected reportProgress(
    context: NodeExecutionContext,
    progress: number,
    message?: string,
  ): void {
    context.reportProgress(Math.max(0, Math.min(100, progress)), message);
  }

  protected log(
    context: NodeExecutionContext,
    level: "debug" | "info" | "warn" | "error",
    message: string,
    data?: Record<string, unknown>,
  ): void {
    const logMessage = `[${context.nodeId}] ${message}`;
    if (context.log && context.log[level]) {
      context.log[level](logMessage, data);
    }
  }

  protected createSuccessResult(
    outputs: Record<string, unknown>,
    metadata?: Record<string, unknown>,
  ): NodeExecutionResult {
    return {
      success: true,
      outputs,
      metadata: {
        executedAt: new Date().toISOString(),
        nodeId: this.context?.nodeId,
        nodeType: this.context?.nodeId?.split("-")[0],
        ...metadata,
      },
    };
  }

  protected createErrorResult(
    error: string | Error,
    metadata?: Record<string, unknown>,
  ): NodeExecutionResult {
    const errorMessage = typeof error === "string" ? error : error.message;

    return {
      success: false,
      error: errorMessage,
      metadata: {
        executionTime: Date.now(),
        ...metadata,
      },
    };
  }

  protected validateRequiredInputs(
    context: NodeExecutionContext,
    requiredInputs: string[],
  ): { valid: boolean; missingInputs: string[] } {
    const missingInputs: string[] = [];

    for (const inputId of requiredInputs) {
      const value = context.inputs?.[inputId];
      if (value === undefined || value === null) {
        missingInputs.push(inputId);
      }
    }

    return {
      valid: missingInputs.length === 0,
      missingInputs,
    };
  }

  protected async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage: string = "Operation timed out",
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  protected async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 1000,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxRetries) {
          throw lastError;
        }

        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  protected sanitizeString(input: unknown): string {
    if (typeof input === "string") {
      // Remove ASCII control characters (0-31) and DEL (127)
      return input.replace(/[\p{Cc}\u007F]/gu, "");
    }
    return String(input);
  }

  protected deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.deepClone(item)) as unknown as T;
    }

    const cloned = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }

    return cloned;
  }
}
