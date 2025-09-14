import type { Document } from "yaml";
import type {
  ParseResult,
  StreamParseOptions,
  ValidationSchema,
  YamlDocument,
  YamlError,
  YamlParseOptions,
  YamlStringifyOptions,
  YamlValue,
} from "./types";
import {
  isValidYaml,
  parseMultipleDocuments,
  parseYaml,
  parseYamlDocument,
  parseYamlStream,
  safeParseYaml,
} from "./utils/parser";
import {
  formatYaml,
  minifyYaml,
  prettifyYaml,
  stringifyYaml,
  stringifyYamlWithComments,
  toYamlDocument,
} from "./utils/stringifier";
import {
  createValidator,
  validateArrayLength,
  validateEnum,
  validatePattern,
  validateRange,
  validateRequired,
  validateSchema,
  validateType,
} from "./utils/validator";

/**
 * YamlAPI - Main interface for interacting with the YAML package
 * Provides a comprehensive API for YAML parsing, stringification, validation, and file operations
 */
export class YamlAPI {
  private static instance: YamlAPI;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  /**
   * Get the singleton instance of YamlAPI
   */
  static getInstance(): YamlAPI {
    if (!YamlAPI.instance) {
      YamlAPI.instance = new YamlAPI();
    }
    return YamlAPI.instance;
  }

  /**
   * Parse a YAML string into a JavaScript object
   */
  parse<T = YamlDocument>(input: string, options?: YamlParseOptions): T {
    return parseYaml<T>(input, options);
  }

  /**
   * Safely parse a YAML string with error handling
   */
  safeParse<T = YamlDocument>(
    input: string,
    options?: YamlParseOptions,
  ): ParseResult<T> {
    return safeParseYaml<T>(input, options);
  }

  /**
   * Parse a YAML string into a Document object for advanced operations
   */
  parseDocument(input: string, options?: YamlParseOptions): Document {
    return parseYamlDocument(input, options);
  }

  /**
   * Parse multiple YAML documents from a single string
   */
  parseMultiple(input: string, options?: YamlParseOptions): Document[] {
    return parseMultipleDocuments(input, options);
  }

  /**
   * Parse a YAML stream with document callbacks
   */
  async parseStream(
    input: string,
    options?: StreamParseOptions,
  ): Promise<YamlDocument[]> {
    return parseYamlStream(input, options);
  }

  /**
   * Check if a string is valid YAML
   */
  isValid(input: string, options?: YamlParseOptions): boolean {
    return isValidYaml(input, options);
  }

  // ========== Stringification Methods ==========

  /**
   * Convert a JavaScript object to YAML string
   */
  stringify(value: unknown, options?: YamlStringifyOptions): string {
    return stringifyYaml(value, options);
  }

  /**
   * Stringify with comment support (limited by yaml library)
   */
  stringifyWithComments(
    value: unknown,
    comments?: { [key: string]: string },
    options?: YamlStringifyOptions,
  ): string {
    return stringifyYamlWithComments(value, comments, options);
  }

  /**
   * Format a YAML string with default options
   */
  format(input: string, options?: YamlStringifyOptions): string {
    return formatYaml(input, options);
  }

  /**
   * Minify a YAML string for compact storage
   */
  minify(input: string): string {
    return minifyYaml(input);
  }

  /**
   * Prettify a YAML string with indentation
   */
  prettify(input: string, indent: number = 2): string {
    return prettifyYaml(input, indent);
  }

  /**
   * Create a Document object from a JavaScript value
   */
  toDocument(value: YamlDocument): Document {
    return toYamlDocument(value);
  }

  // ========== Validation Methods ==========

  /**
   * Create a custom validator with type predicate
   */
  createValidator<T = YamlDocument>(
    schema: (data: unknown) => data is T,
  ): ValidationSchema<T> {
    return createValidator<T>(schema);
  }

  /**
   * Validate required fields in a YAML document
   */
  validateRequired(data: YamlDocument, requiredFields: string[]): YamlError[] {
    return validateRequired(data, requiredFields);
  }

  /**
   * Validate the type of a value
   */
  validateType(
    value: unknown,
    expectedType: "string" | "number" | "boolean" | "object" | "array",
  ): boolean {
    return validateType(value, expectedType);
  }

  /**
   * Validate a value against an enum
   */
  validateEnum<T>(value: unknown, allowedValues: readonly T[]): value is T {
    return validateEnum(value, allowedValues);
  }

  /**
   * Validate a string against a pattern
   */
  validatePattern(value: string, pattern: RegExp): boolean {
    return validatePattern(value, pattern);
  }

  /**
   * Validate a number is within a range
   */
  validateRange(value: number, min?: number, max?: number): boolean {
    return validateRange(value, min, max);
  }

  /**
   * Validate array length constraints
   */
  validateArrayLength(
    array: unknown[],
    minLength?: number,
    maxLength?: number,
  ): boolean {
    return validateArrayLength(array, minLength, maxLength);
  }

  /**
   * Validate data against a schema
   */
  validateSchema<T = YamlDocument>(
    data: unknown,
    schema: ValidationSchema<T>,
  ): YamlError[] {
    return validateSchema(data, schema);
  }

  // ========== Conversion Methods ==========

  /**
   * Convert YAML string to JSON object
   * Used when loading from storage for editing or execution
   */
  fromYaml<T = YamlDocument>(yamlString: string): T {
    return this.parse<T>(yamlString);
  }

  /**
   * Convert JSON object to YAML string
   * Used when saving edited content back to storage
   */
  toYaml(jsonObject: unknown, options?: YamlStringifyOptions): string {
    return this.stringify(jsonObject, options);
  }

  /**
   * Parse JSON string to object (for completeness)
   * Note: This is just JSON.parse but provided for API consistency
   */
  fromJson<T = YamlDocument>(jsonString: string): T {
    try {
      return JSON.parse(jsonString) as T;
    } catch (error) {
      throw new Error(
        `Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Convert object to JSON string (for completeness)
   * Note: This is just JSON.stringify but provided for API consistency
   */
  toJson(object: unknown, indent?: number): string {
    try {
      return JSON.stringify(object, null, indent);
    } catch (error) {
      throw new Error(
        `Failed to stringify JSON: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // ========== Utility Methods ==========

  /**
   * Check if a value is a valid YAML value type
   */
  isYamlValue(value: unknown): value is YamlValue {
    return (
      value === null ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      (typeof value === "object" && value !== null) ||
      Array.isArray(value)
    );
  }

  /**
   * Get version information
   */
  getVersion(): string {
    return "0.1.0";
  }
}

// Export singleton instance
export const yaml = YamlAPI.getInstance();
