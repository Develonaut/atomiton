/**
 * CSV Reader Metadata
 *
 * Static metadata definition for the CSV Reader node
 */

import { createAtomicMetadata } from "../../createAtomicMetadata";

export const csvReaderMetadata = createAtomicMetadata({
  id: "csv-reader",
  name: "CSV Reader",
  description: "Read CSV files and spreadsheet data",
  category: "io",
  icon: "table-2",
  keywords: ["csv", "data", "import", "spreadsheet", "table", "file", "read"],
  tags: ["csv", "data", "import", "spreadsheet", "table"],
});
