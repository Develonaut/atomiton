export function createSafeListener<T>(
  handler: (data: T) => void,
  domain: string,
  event: string,
): (...args: unknown[]) => void {
  return (data: unknown) => {
    try {
      handler(data as T);
    } catch (error) {
      console.error(`Event handler error in ${domain}:${event}:`, error);
    }
  };
}
