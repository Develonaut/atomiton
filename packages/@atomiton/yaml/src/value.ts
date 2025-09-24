export function isYamlValue(value: unknown): boolean {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    (typeof value === "object" && value !== null) ||
    Array.isArray(value)
  );
}
