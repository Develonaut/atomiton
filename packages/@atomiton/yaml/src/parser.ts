import type {
    ParseResult,
    StreamParseOptions,
    YamlDocument,
    YamlError,
    YamlParseOptions,
} from "#types.js";
import type { Document } from "yaml";
import { parse, parseAllDocuments, parseDocument } from "yaml";

export function parseYaml<T = YamlDocument>(
  input: string,
  options?: YamlParseOptions,
): T {
  return parse(input, options) as T;
}

export function safeParseYaml<T = YamlDocument>(
  input: string,
  options?: YamlParseOptions,
): ParseResult<T> {
  try {
    const doc = parseDocument(input, options);
    const errors = doc.errors.map((error) => ({
      message: error.message,
      line: error.linePos?.[0]?.line,
      column: error.linePos?.[0]?.col,
    }));

    const warnings = doc.warnings.map((warning) => ({
      message: warning.message,
      line: warning.linePos?.[0]?.line,
      column: warning.linePos?.[0]?.col,
    }));

    if (errors.length > 0) {
      return {
        data: doc.toJSON() as T,
        errors,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    }

    return {
      data: doc.toJSON() as T,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      data: {} as T,
      errors: [{ message: errorMessage }],
    };
  }
}

export function parseYamlDocument(
  input: string,
  options?: YamlParseOptions,
): Document {
  return parseDocument(input, options);
}

export function parseMultipleDocuments(
  input: string,
  options?: YamlParseOptions,
): Document[] {
  return parseAllDocuments(input, options);
}

export async function parseYamlStream(
  input: string,
  options?: StreamParseOptions,
): Promise<YamlDocument[]> {
  const documents: YamlDocument[] = [];
  const errors: YamlError[] = [];

  try {
    const docs = parseAllDocuments(input, options);

    docs.forEach((doc, index) => {
      if (doc.errors.length > 0) {
        doc.errors.forEach((error) => {
          const yamlError: YamlError = {
            message: error.message,
            line: error.linePos?.[0]?.line,
            column: error.linePos?.[0]?.col,
          };
          errors.push(yamlError);
          options?.onError?.(yamlError);
        });
      }

      const jsonDoc = doc.toJSON() as YamlDocument;
      documents.push(jsonDoc);
      options?.onDocument?.(jsonDoc, index);
    });

    return documents;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const yamlError: YamlError = { message: errorMessage };

    options?.onError?.(yamlError);
    throw new Error(`Failed to parse YAML stream: ${errorMessage}`);
  }
}

export function isValidYaml(
  input: string,
  options?: YamlParseOptions,
): boolean {
  try {
    const doc = parseDocument(input, options);
    return doc.errors.length === 0;
  } catch {
    return false;
  }
}
