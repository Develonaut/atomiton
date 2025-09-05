/**
 * CSV Parser Logic - Pure business logic implementation
 *
 * NO UI IMPORTS ALLOWED IN THIS FILE
 * This file contains only the execution logic for CSV parsing
 */

import { z } from "zod";

import { BaseNodeLogic } from "../../base/BaseNodeLogic";
import type { NodeExecutionContext, NodeExecutionResult } from "../../types";

/**
 * CSV Parser Configuration Schema
 */
export const csvParserConfigSchema = z.object({
  delimiter: z.string().default(",").describe("Field delimiter character"),
  quote: z.string().default('"').describe("Quote character for fields"),
  escape: z.string().default("\\").describe("Escape character"),
  hasHeaders: z.boolean().default(true).describe("First row contains headers"),
  skipEmptyLines: z.boolean().default(true).describe("Skip empty lines"),
  trimFields: z.boolean().default(true).describe("Trim whitespace from fields"),
  encoding: z
    .enum(["utf8", "ascii", "latin1"])
    .default("utf8")
    .describe("Text encoding"),
  maxRows: z
    .number()
    .min(1)
    .max(1000000)
    .optional()
    .describe("Maximum rows to parse"),
  validateData: z.boolean().default(true).describe("Enable data validation"),
  outputFormat: z
    .enum(["objects", "arrays"])
    .default("objects")
    .describe("Output format for records"),
});

/**
 * CSV Parser Configuration Type
 */
export type CSVParserConfig = z.infer<typeof csvParserConfigSchema>;

/**
 * Parsed CSV Result
 */
interface ParsedCSVResult {
  records: Array<Record<string, unknown>>;
  headers: string[];
  metadata: {
    totalRows: number;
    totalColumns: number;
    parsingTime: number;
    hasHeaders: boolean;
    delimiter: string;
    encoding: string;
    dataSummary: {
      emptyRows: number;
      inconsistentRows: number;
      averageFieldsPerRow: number;
    };
  };
}

/**
 * CSV Parser Logic Implementation
 * Pure business logic with no UI concerns
 */
export class CSVParserLogic extends BaseNodeLogic<CSVParserConfig> {
  /**
   * Execute CSV parsing
   */
  public async execute(
    context: NodeExecutionContext,
    config: CSVParserConfig,
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();

    try {
      this.log(context, "info", "Starting CSV parsing");

      const csvData = this.getInput<string>(context, "csv_data");
      const customHeaders = this.getInput<string[]>(context, "headers");

      // Validate required inputs
      const inputValidation = this.validateRequiredInputs(context, [
        "csv_data",
      ]);
      if (!inputValidation.valid) {
        return this.createErrorResult(
          `Missing required inputs: ${inputValidation.missingInputs.join(", ")}`,
        );
      }

      if (!csvData || typeof csvData !== "string") {
        return this.createErrorResult(
          "CSV data is required and must be a string",
        );
      }

      if (customHeaders && !Array.isArray(customHeaders)) {
        return this.createErrorResult(
          "Custom headers must be an array of strings",
        );
      }

      this.reportProgress(context, 10, "Parsing CSV structure");

      // Check for abort
      if (this.shouldAbort(context)) {
        return this.createErrorResult("Execution was aborted");
      }

      // Parse CSV data
      const parseResult = await this.parseCSVData(
        csvData,
        config,
        customHeaders,
        context,
      );

      this.reportProgress(context, 80, "Processing parsed data");

      // Validate data if requested
      if (config.validateData) {
        const validationResult = this.validateParsedData(
          parseResult.records,
          context,
        );
        if (!validationResult.valid && validationResult.warnings) {
          this.log(context, "warn", "Data validation found issues", {
            warnings: validationResult.warnings,
          });
        }
      }

      const metadata = {
        ...parseResult.metadata,
        parsingTime: Date.now() - startTime,
      };

      this.reportProgress(context, 100, "CSV parsing completed");
      this.log(
        context,
        "info",
        `Successfully parsed ${parseResult.records.length} records with ${parseResult.headers.length} columns`,
      );

      return this.createSuccessResult({
        records: parseResult.records,
        headers: parseResult.headers,
        row_count: parseResult.records.length,
        metadata,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.log(context, "error", "CSV parsing failed", { error: err.message });
      return this.createErrorResult(err, {
        stage: "csv-parsing",
        processingTime: Date.now() - startTime,
      });
    }
  }

  /**
   * Get default configuration
   */
  getDefaultConfig(): CSVParserConfig {
    return {
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
  }

  /**
   * Validate configuration
   */
  validateConfig(config: unknown): config is CSVParserConfig {
    try {
      if (!config || typeof config !== "object") {
        return false;
      }
      csvParserConfigSchema.parse(config);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate inputs
   */
  validateInputs(inputs: Record<string, unknown>): boolean {
    const csvData = inputs.csv_data;
    const customHeaders = inputs.headers;

    if (!csvData || typeof csvData !== "string") {
      return false;
    }

    if (customHeaders !== undefined && !Array.isArray(customHeaders)) {
      return false;
    }

    return true;
  }

  // Private helper methods

  /**
   * Parse CSV data with configuration options
   */
  private async parseCSVData(
    csvData: string,
    config: CSVParserConfig,
    customHeaders: string[] | undefined,
    context: NodeExecutionContext,
  ): Promise<ParsedCSVResult> {
    // Split into lines
    let lines = csvData.split(/\r?\n/);

    if (config.skipEmptyLines) {
      lines = lines.filter((line) => line.trim().length > 0);
    }

    if (lines.length === 0) {
      throw new Error("No data lines found in CSV");
    }

    this.log(context, "debug", `Processing ${lines.length} lines`);

    // Extract headers
    let headers: string[];
    let dataStartIndex = 0;

    if (customHeaders) {
      headers = [...customHeaders];
      dataStartIndex = config.hasHeaders ? 1 : 0;
    } else if (config.hasHeaders) {
      headers = this.parseCSVLine(lines[0], config);
      dataStartIndex = 1;
    } else {
      const firstLine = this.parseCSVLine(lines[0], config);
      headers = firstLine.map((_, index) => `Column_${index + 1}`);
      dataStartIndex = 0;
    }

    if (config.trimFields) {
      headers = headers.map((h) => h.trim());
    }

    this.log(context, "debug", `Extracted headers: ${headers.join(", ")}`);

    // Parse data rows
    const records: Array<Record<string, unknown>> = [];
    const maxRows = config.maxRows || lines.length;
    const dataLines = lines.slice(
      dataStartIndex,
      Math.min(dataStartIndex + maxRows, lines.length),
    );

    let emptyRows = 0;
    let inconsistentRows = 0;
    let totalFields = 0;

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];

      // Check for abort periodically
      if (i % 1000 === 0 && this.shouldAbort(context)) {
        throw new Error("CSV parsing was aborted");
      }

      // Update progress periodically
      if (i % 100 === 0) {
        const progress = 10 + (i / dataLines.length) * 70; // 10% to 80%
        this.reportProgress(
          context,
          progress,
          `Parsing row ${i + 1}/${dataLines.length}`,
        );
      }

      try {
        const fields = this.parseCSVLine(line, config);
        totalFields += fields.length;

        if (config.trimFields) {
          fields.forEach((field, index) => {
            fields[index] = typeof field === "string" ? field.trim() : field;
          });
        }

        // Check for empty rows
        const isEmpty = fields.every((field) => field === "" || field === null);
        if (isEmpty) {
          emptyRows++;
        }

        // Check for inconsistent field count
        if (fields.length !== headers.length) {
          inconsistentRows++;
        }

        // Create record
        let record: Record<string, unknown> | string[];
        if (config.outputFormat === "objects") {
          record = {};
          headers.forEach((header, index) => {
            (record as Record<string, unknown>)[header] =
              index < fields.length ? fields[index] : null;
          });
        } else {
          record = [...fields];
          // Pad with nulls if needed
          while (record.length < headers.length) {
            record.push("");
          }
        }

        records.push(record as Record<string, unknown>);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        this.log(
          context,
          "warn",
          `Error parsing line ${dataStartIndex + i + 1}: ${err.message}`,
        );
        // Continue with next line
      }
    }

    const metadata = {
      totalRows: records.length,
      totalColumns: headers.length,
      parsingTime: 0, // Will be set by caller
      hasHeaders: config.hasHeaders,
      delimiter: config.delimiter,
      encoding: config.encoding,
      dataSummary: {
        emptyRows,
        inconsistentRows,
        averageFieldsPerRow:
          records.length > 0 ? totalFields / records.length : 0,
      },
    };

    return { records, headers, metadata };
  }

  /**
   * Parse a single CSV line respecting quotes and escapes
   */
  private parseCSVLine(line: string, config: CSVParserConfig): string[] {
    const fields: string[] = [];
    const { delimiter, quote, escape } = config;

    let currentField = "";
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === escape && nextChar === quote) {
        // Escaped quote
        currentField += quote;
        i += 2;
      } else if (char === quote) {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      } else if (char === delimiter && !inQuotes) {
        // Field delimiter
        fields.push(currentField);
        currentField = "";
        i++;
      } else {
        // Regular character
        currentField += char;
        i++;
      }
    }

    // Add the last field
    fields.push(currentField);

    return fields;
  }

  /**
   * Validate parsed data for common issues
   */
  private validateParsedData(
    records: Array<Record<string, unknown>>,
    context: NodeExecutionContext,
  ): { valid: boolean; warnings?: string[] } {
    const warnings: string[] = [];

    if (records.length === 0) {
      warnings.push("No records were parsed from the CSV data");
    }

    // Check for inconsistent record structures (if objects)
    if (
      records.length > 0 &&
      typeof records[0] === "object" &&
      !Array.isArray(records[0])
    ) {
      const firstKeys = Object.keys(records[0]).sort();

      for (let i = 1; i < Math.min(records.length, 100); i++) {
        // Check first 100 records
        const currentKeys = Object.keys(records[i]).sort();
        if (JSON.stringify(currentKeys) !== JSON.stringify(firstKeys)) {
          warnings.push(
            `Inconsistent record structure detected at row ${i + 1}`,
          );
          break;
        }
      }
    }

    // Check for empty records
    const emptyRecords = records.filter((record) => {
      if (Array.isArray(record)) {
        return record.every((field) => field === null || field === "");
      } else {
        return Object.values(record).every(
          (value) => value === null || value === "",
        );
      }
    });

    if (emptyRecords.length > 0) {
      warnings.push(`Found ${emptyRecords.length} empty records`);
    }

    if (warnings.length > 0) {
      this.log(context, "warn", "Data validation warnings", { warnings });
    }

    return {
      valid: true, // Warnings don't make data invalid
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }
}
