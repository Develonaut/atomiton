/**
 * CSV Reader Parameters
 *
 * Parameter schema for reading CSV files and spreadsheet data
 */

import type { VInfer } from "@atomiton/validation";
import v from "@atomiton/validation";
import { createAtomicParameters } from "../../createAtomicParameters";

const csvReaderSchema = {
  filePath: v.string().optional().describe("Path to the CSV file to read"),

  hasHeaders: v
    .boolean()
    .default(true)
    .describe("Whether the first row contains column headers"),

  delimiter: v.string().default(",").describe("Field delimiter character"),
};

export const csvReaderParameters = createAtomicParameters(
  csvReaderSchema,
  {
    hasHeaders: true,
    delimiter: ",",
  },
  {
    filePath: {
      controlType: "file",
      label: "CSV File Path",
      placeholder: "Select or enter path to CSV file",
      helpText: "The path to the CSV file you want to read",
    },
    hasHeaders: {
      controlType: "boolean",
      label: "Has Header Row",
      helpText: "Check if the first row contains column headers",
    },
    delimiter: {
      controlType: "select",
      label: "Field Delimiter",
      helpText: "Character used to separate fields in the CSV",
      options: [
        { value: ",", label: "Comma (,)" },
        { value: ";", label: "Semicolon (;)" },
        { value: "\t", label: "Tab" },
        { value: "|", label: "Pipe (|)" },
      ],
    },
  },
);

export type CSVReaderParameters = VInfer<typeof csvReaderParameters.schema>;
