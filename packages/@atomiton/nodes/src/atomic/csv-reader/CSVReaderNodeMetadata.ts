/**
 * CSV Reader Node Metadata
 *
 * Static metadata definition for the CSV Reader node
 */

import { NodeMetadata } from "../../base/NodeMetadata";

/**
 * CSV Reader Metadata Class
 */
class CSVReaderNodeMetadata extends NodeMetadata {
  readonly id = "csv-reader";
  readonly name = "CSV Reader";
  readonly type = "csv-reader";
  readonly version = "1.0.0";
  readonly author = "Atomiton Core Team";
  readonly description = "Read CSV files and spreadsheet data";
  readonly category = "io";
  readonly icon = "table-2";

  // Keywords for search and discovery
  readonly keywords = [
    "csv",
    "data",
    "import",
    "spreadsheet",
    "table",
    "file",
    "read",
  ];
  readonly tags = ["csv", "data", "import", "spreadsheet", "table"];

  // Optional overrides
  readonly experimental = false;
  readonly deprecated = false;
}

// Export singleton instance
export const csvReaderMetadata = new CSVReaderNodeMetadata();

// Export the metadata instance as default for consistency
export default csvReaderMetadata;
