export interface RetryOptions {
  maxAttempts?: number;
  backoff?: "linear" | "exponential" | "fixed";
  initialDelay?: number;
  maxDelay?: number;
  multiplier?: number;
  isRetryable?: (error: Error) => boolean;
  onRetry?: (error: Error, attempt: number) => void;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    backoff = "exponential",
    initialDelay = 100,
    maxDelay = 5000,
    multiplier = 2,
    isRetryable = (_error): boolean => true,
    onRetry,
  } = options;

  if (maxAttempts <= 0) {
    throw new Error("maxAttempts must be greater than 0");
  }

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts || !isRetryable(lastError)) {
        throw lastError;
      }

      if (onRetry) {
        onRetry(lastError, attempt);
      }

      let delay: number;
      switch (backoff) {
        case "linear":
          delay = Math.min(initialDelay * attempt, maxDelay);
          break;
        case "exponential":
          delay = Math.min(
            initialDelay * Math.pow(multiplier, attempt - 1),
            maxDelay,
          );
          break;
        case "fixed":
        default:
          delay = initialDelay;
          break;
      }

      await sleep(delay);
    }
  }

  throw lastError!;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createRetryWrapper(defaultOptions: RetryOptions = {}) {
  return function <T>(
    fn: () => Promise<T>,
    overrides: RetryOptions = {},
  ): Promise<T> {
    return withRetry(fn, { ...defaultOptions, ...overrides });
  };
}

export const RetryStrategies = {
  quick: (): RetryOptions => ({
    maxAttempts: 3,
    backoff: "fixed",
    initialDelay: 50,
  }),

  standard: (): RetryOptions => ({
    maxAttempts: 3,
    backoff: "exponential",
    initialDelay: 100,
    maxDelay: 2000,
  }),

  aggressive: (): RetryOptions => ({
    maxAttempts: 5,
    backoff: "exponential",
    initialDelay: 100,
    maxDelay: 10000,
    multiplier: 2,
  }),

  network: (): RetryOptions => ({
    maxAttempts: 4,
    backoff: "exponential",
    initialDelay: 1000,
    maxDelay: 30000,
    isRetryable: (error): boolean => {
      const message = error.message.toLowerCase();
      return (
        message.includes("network") ||
        message.includes("timeout") ||
        message.includes("connection") ||
        message.includes("econnrefused") ||
        message.includes("enotfound")
      );
    },
  }),
};
