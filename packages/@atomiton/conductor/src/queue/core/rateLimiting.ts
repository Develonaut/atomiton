/**
 * Rate limiting functions for queue system
 */

export function createRateLimiter(options: {
  enableRateLimiting: boolean;
  rateLimit: { limit: number; duration: number };
}) {
  let rateLimitWindow: number[] = [];

  const checkRateLimit = (): boolean => {
    if (!options.enableRateLimiting) return true;

    const now = Date.now();
    rateLimitWindow = rateLimitWindow.filter(
      (time) => now - time < options.rateLimit.duration,
    );

    return rateLimitWindow.length < options.rateLimit.limit;
  };

  const recordRequest = (): void => {
    rateLimitWindow.push(Date.now());
  };

  const getRemainingLimit = (): number | undefined => {
    if (!options.enableRateLimiting) return undefined;
    return options.rateLimit.limit - rateLimitWindow.length;
  };

  const cleanup = (now: number): void => {
    rateLimitWindow = rateLimitWindow.filter(
      (time) => now - time < options.rateLimit.duration,
    );
  };

  return {
    checkRateLimit,
    recordRequest,
    getRemainingLimit,
    cleanup,
  };
}
