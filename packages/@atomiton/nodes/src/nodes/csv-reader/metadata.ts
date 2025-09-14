/**
 * CSV Reader Metadata
 *
 * Static metadata definition for the CSV Reader node
 */

import { createNodeMetadata } from "../../base/createNodeMetadata";

export const csvReaderMetadata = createNodeMetadata({
  id: "csv-reader",
  name: "CSV Reader",
  description: "Read CSV files and spreadsheet data",
  category: "io",
  icon: "table-2",
  keywords: ["csv", "data", "import", "spreadsheet", "table", "file", "read"],
  tags: ["csv", "data", "import", "spreadsheet", "table"],
});
