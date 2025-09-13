import { yaml } from "@atomiton/yaml";

/**
 * Extract metadata from a YAML string without full parsing
 * Useful for quick file identification and cataloging
 */
export function extractCompositeMetadata(yamlString: string): {
  id?: string;
  name?: string;
  version?: string;
  created?: string;
  modified?: string;
} | null {
  // Return null for empty input
  if (!yamlString || yamlString.trim() === "") {
    return null;
  }

  try {
    const parsed = yaml.fromYaml<Record<string, unknown>>(yamlString);
    return {
      id: typeof parsed?.id === "string" ? parsed.id : undefined,
      name: typeof parsed?.name === "string" ? parsed.name : undefined,
      version: typeof parsed?.version === "string" ? parsed.version : undefined,
      created:
        typeof parsed?.metadata === "object" &&
        parsed.metadata &&
        typeof (parsed.metadata as Record<string, unknown>).created === "string"
          ? ((parsed.metadata as Record<string, unknown>).created as string)
          : undefined,
      modified:
        typeof parsed?.metadata === "object" &&
        parsed.metadata &&
        typeof (parsed.metadata as Record<string, unknown>).modified ===
          "string"
          ? ((parsed.metadata as Record<string, unknown>).modified as string)
          : undefined,
    };
  } catch {
    return null;
  }
}
