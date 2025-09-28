/**
 * Format duration in a human-readable format
 * @param ms Duration in milliseconds
 * @returns Formatted string like "100ms", "1.5s", "2.3m"
 *
 * @example
 * formatDuration(50) // "50ms"
 * formatDuration(1500) // "1.5s"
 * formatDuration(90000) // "1.5m"
 * formatDuration(0.5) // "<1ms"
 */
export function formatDuration(ms: number): string {
  if (ms < 1) return "<1ms";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}
