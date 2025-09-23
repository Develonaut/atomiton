export function createEventName(
  domain: string,
  event: string | number | symbol,
): string {
  return `${domain}:${String(event)}`;
}
