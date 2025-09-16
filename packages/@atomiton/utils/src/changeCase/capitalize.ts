/**
 * Capitalize the first letter of a string
 * @example capitalize("hello") => "Hello"
 * @example capitalize("hello world") => "Hello world"
 */
export function capitalize<T extends string>(str: T): Capitalize<T> {
  if (!str) return str as Capitalize<T>;
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>;
}
