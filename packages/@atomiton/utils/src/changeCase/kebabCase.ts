/**
 * Convert string to kebab-case
 * @example kebabCase("camelCase") => "camel-case"
 * @example kebabCase("PascalCase") => "pascal-case"
 * @example kebabCase("snake_case") => "snake-case"
 * @example kebabCase("Title Case") => "title-case"
 */
export function kebabCase(str: string): string {
  if (!str) return str;

  return (
    str
      // Insert hyphen before uppercase letters that follow lowercase letters or numbers
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      // Replace spaces, underscores, and multiple hyphens with single hyphen
      .replace(/[\s_-]+/g, "-")
      // Convert to lowercase
      .toLowerCase()
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, "")
  );
}
