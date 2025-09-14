/**
 * Convert a string to title case
 * @example titleCase("hello world") => "Hello World"
 * @example titleCase("hello-world") => "Hello World"
 * @example titleCase("hello_world") => "Hello World"
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/[\s-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
