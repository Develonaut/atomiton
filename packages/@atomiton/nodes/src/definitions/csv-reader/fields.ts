/**
 * CSV Reader Field Configuration
 * UI field configurations for CSV reader parameters
 */

import { createFieldsFromSchema } from "#core/utils/createFieldsFromSchema";
import { csvReaderSchema } from "#schemas/csv-reader";

/**
 * Field configuration for CSV reader parameters
 *
 * Auto-derived from csvReaderSchema with selective overrides for:
 * - delimiter: enum with descriptive labels
 */
export const csvReaderFields = createFieldsFromSchema(csvReaderSchema, {
  delimiter: {
    options: [
      { value: ",", label: "Comma" },
      { value: ";", label: "Semicolon" },
      { value: "\t", label: "Tab" },
      { value: "|", label: "Pipe" },
    ],
  },
});
