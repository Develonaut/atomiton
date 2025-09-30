/**
 * @atomiton/yaml
 *
 * YAML parsing, stringifying, and validation utilities
 * - Parse YAML documents with comprehensive error handling
 * - Stringify values with formatting options
 * - Schema validation and type checking
 * - JSON interoperability
 */

// Parser exports
export {
  // Convenience alias
  parseYaml as fromYaml,
  isValidYaml as isValid,
  parseYaml as parse,
  parseYamlDocument as parseDocument,
  parseMultipleDocuments as parseMultiple,
  parseYamlStream as parseStream,
  safeParseYaml as safeParse,
} from "#parser.js";

// Stringifier exports
export {
  formatYaml as format,
  minifyYaml as minify,
  prettifyYaml as prettify,
  stringifyYaml as stringify,
  stringifyYamlWithComments as stringifyWithComments,
  toYamlDocument as toDocument,
  // Convenience alias
  stringifyYaml as toYaml,
} from "#stringifier.js";

// Validator exports
export {
  createValidator,
  validateArrayLength,
  validateEnum,
  validatePattern,
  validateRange,
  validateRequired,
  validateSchema,
  validateType,
} from "#validator.js";

// JSON utilities
export { fromJson, toJson } from "#json.js";

// Value utilities
export { isYamlValue } from "#value.js";

// Version
export { getVersion } from "#version.js";

// Type exports
export type {
  YamlParseOptions,
  YamlStringifyOptions,
  YamlValue,
  YamlObject,
  YamlArray,
  YamlDocument,
  ParseResult,
  YamlError,
  YamlWarning,
  StreamParseOptions,
  ValidationSchema,
} from "#types.js";
