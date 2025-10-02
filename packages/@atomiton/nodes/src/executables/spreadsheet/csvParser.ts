/**
 * CSV/TSV Parser Utilities
 * Manual CSV parsing with delimiter and quote handling
 */

/**
 * Parse CSV data manually with custom delimiter support
 */
export function parseCSVManually(
  content: string,
  delimiter: string = ",",
  hasHeaders: boolean = true,
  skipEmptyLines: boolean = true,
): Record<string, string>[] | string[][] {
  const lines = content
    .split(/\r?\n/)
    .filter((line) => !skipEmptyLines || line.trim().length > 0);

  if (lines.length === 0) return [];

  const rows = lines.map((line) => {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"' && !inQuotes) {
        inQuotes = true;
      } else if (char === '"' && inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else if (char === '"' && inQuotes) {
        inQuotes = false;
      } else if (char === delimiter && !inQuotes) {
        cells.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    cells.push(current.trim());
    return cells;
  });

  if (!hasHeaders) {
    return rows;
  }

  if (rows.length === 0) return [];

  const headers = rows[0];
  const dataRows = rows.slice(1);

  return dataRows.map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || "";
    });
    return obj;
  });
}

/**
 * Auto-detect delimiter for CSV-like files
 */
export function detectDelimiter(
  filePath: string,
  configDelimiter?: string,
): string {
  if (configDelimiter) return configDelimiter;

  const ext = filePath.split(".").pop()?.toLowerCase();
  // TSV files use tab delimiter by default
  if (ext === "tsv") return "\t";

  // Default to comma for CSV and other formats
  return ",";
}

/**
 * Detect format from file extension
 */
export function detectFormat(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase();
  // TSV files are treated as CSV with tab delimiter
  if (ext === "tsv") return "csv";
  return ext || "csv";
}
