/**
 * CSV Parser Configuration
 *
 * Shared configuration schema and types between logic and UI.
 * This ensures consistency and prevents drift between components.
 */

import { z } from "zod";

/**
 * CSV Parser Configuration Schema
 * This is the single source of truth for configuration structure
 */
export const csvParserConfigSchema = z.object({
  // Basic CSV parsing options
  delimiter: z
    .string()
    .min(1)
    .max(1)
    .default(",")
    .describe("Field delimiter character (e.g., comma, semicolon, tab)"),

  quote: z
    .string()
    .min(1)
    .max(1)
    .default('"')
    .describe("Quote character used to wrap fields containing delimiters"),

  escape: z
    .string()
    .min(1)
    .max(1)
    .default("\\")
    .describe("Escape character used to escape quote characters within fields"),

  // Header handling
  hasHeaders: z
    .boolean()
    .default(true)
    .describe("Whether the first row contains column headers"),

  // Data cleaning options
  skipEmptyLines: z
    .boolean()
    .default(true)
    .describe("Skip lines that are empty or contain only whitespace"),

  trimFields: z
    .boolean()
    .default(true)
    .describe("Remove leading and trailing whitespace from field values"),

  // Encoding and format options
  encoding: z
    .enum(["utf8", "ascii", "latin1"])
    .default("utf8")
    .describe("Character encoding of the input CSV data"),

  // Processing limits
  maxRows: z
    .number()
    .int()
    .min(1)
    .max(1000000)
    .optional()
    .describe("Maximum number of data rows to process (excludes header)"),

  // Validation options
  validateData: z
    .boolean()
    .default(true)
    .describe("Enable validation checks for data consistency and quality"),

  // Output format
  outputFormat: z
    .enum(["objects", "arrays"])
    .default("objects")
    .describe(
      "Format for output records: objects (key-value) or arrays (positional)",
    ),
});

/**
 * Inferred TypeScript type from schema
 */
export type CSVParserConfig = z.infer<typeof csvParserConfigSchema>;

/**
 * Default configuration values
 */
export const defaultCSVParserConfig: CSVParserConfig = {
  delimiter: ",",
  quote: '"',
  escape: "\\",
  hasHeaders: true,
  skipEmptyLines: true,
  trimFields: true,
  encoding: "utf8",
  validateData: true,
  outputFormat: "objects",
};

/**
 * Configuration presets for common CSV formats
 */
export const csvParserPresets = {
  // Standard comma-separated values
  standard: {
    delimiter: ",",
    quote: '"',
    escape: "\\",
    hasHeaders: true,
    skipEmptyLines: true,
    trimFields: true,
    encoding: "utf8" as const,
    validateData: true,
    outputFormat: "objects" as const,
  },

  // European semicolon-separated values
  european: {
    delimiter: ";",
    quote: '"',
    escape: "\\",
    hasHeaders: true,
    skipEmptyLines: true,
    trimFields: true,
    encoding: "utf8" as const,
    validateData: true,
    outputFormat: "objects" as const,
  },

  // Tab-separated values
  tsv: {
    delimiter: "\t",
    quote: '"',
    escape: "\\",
    hasHeaders: true,
    skipEmptyLines: true,
    trimFields: true,
    encoding: "utf8" as const,
    validateData: true,
    outputFormat: "objects" as const,
  },

  // Pipe-separated values
  pipe: {
    delimiter: "|",
    quote: '"',
    escape: "\\",
    hasHeaders: true,
    skipEmptyLines: true,
    trimFields: true,
    encoding: "utf8" as const,
    validateData: true,
    outputFormat: "objects" as const,
  },

  // No headers, array output (for data processing)
  dataProcessing: {
    delimiter: ",",
    quote: '"',
    escape: "\\",
    hasHeaders: false,
    skipEmptyLines: true,
    trimFields: true,
    encoding: "utf8" as const,
    validateData: false,
    outputFormat: "arrays" as const,
  },
} as const;

/**
 * Validate configuration object
 */
export function validateCSVParserConfig(
  config: unknown,
): config is CSVParserConfig {
  try {
    csvParserConfigSchema.parse(config);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse and normalize configuration with defaults
 */
export function parseCSVParserConfig(config: unknown): CSVParserConfig {
  return csvParserConfigSchema.parse(config);
}

/**
 * Get configuration preset by name
 */
export function getCSVParserPreset(
  name: keyof typeof csvParserPresets,
): CSVParserConfig {
  return { ...csvParserPresets[name] };
}

/**
 * Merge configuration with defaults
 */
export function mergeWithDefaults(
  config: Partial<CSVParserConfig>,
): CSVParserConfig {
  return csvParserConfigSchema.parse({
    ...defaultCSVParserConfig,
    ...config,
  });
}
