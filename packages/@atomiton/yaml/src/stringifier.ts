import { stringify, Document, parseDocument } from "yaml";
import type { YamlStringifyOptions, YamlDocument } from "./types.js";

export function stringifyYaml(
  value: unknown,
  options?: YamlStringifyOptions,
): string {
  return stringify(value, options);
}

export function stringifyYamlWithComments(
  value: unknown,
  comments?: { [key: string]: string },
  options?: YamlStringifyOptions,
): string {
  const doc = new Document(value, options);

  // Comments can be added via the Document API if needed
  // The yaml library's comment handling is complex and requires
  // working with the AST nodes directly
  if (comments) {
    // For now, we'll just return the doc without comments
    // This would require deeper integration with the yaml library's AST
  }

  return doc.toString(options);
}

export function formatYaml(
  input: string,
  options?: YamlStringifyOptions,
): string {
  try {
    const parsed = parseDocument(input);
    return parsed.toString({
      lineWidth: 80,
      minContentWidth: 20,
      ...options,
    });
  } catch (error) {
    throw new Error(
      `Failed to format YAML: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function minifyYaml(input: string): string {
  try {
    const parsed = parseDocument(input);
    return parsed.toString({
      lineWidth: 0,
      minContentWidth: 0,
      simpleKeys: true,
      flowCollectionPadding: false,
    });
  } catch (error) {
    throw new Error(
      `Failed to minify YAML: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function prettifyYaml(input: string, indent: number = 2): string {
  try {
    const parsed = parseDocument(input);
    return parsed.toString({
      indent,
      lineWidth: 80,
      minContentWidth: 20,
      simpleKeys: false,
      flowCollectionPadding: true,
    });
  } catch (error) {
    throw new Error(
      `Failed to prettify YAML: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function toYamlDocument(value: YamlDocument): Document {
  return new Document(value);
}
