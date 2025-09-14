/**
 * CSV Reader Parameters
 *
 * Parameter schema for reading CSV files and spreadsheet data
 */

import { z } from "zod";
import { createNodeParameters } from "../../base/createNodeParameters";

const csvReaderSchema = {
  filePath: z.string().optional().describe("Path to the CSV file to read"),

  hasHeaders: z
    .boolean()
    .default(true)
    .describe("Whether the first row contains column headers"),

  delimiter: z.string().default(",").describe("Field delimiter character"),
};

export const csvReaderParameters = createNodeParameters(
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

export type CSVReaderParameters = z.infer<typeof csvReaderParameters.schema>;
