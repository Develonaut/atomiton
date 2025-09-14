/**
 * CSV Reader Ports
 *
 * Port definitions for the CSV Reader node
 */

import { createNodePorts } from "../../base/createNodePorts";

export const csvReaderPorts = createNodePorts({
  input: [],
  output: [
    {
      id: "data",
      name: "Data",
      dataType: "array",
      required: true,
      multiple: false,
      description: "Parsed CSV data as array of objects",
    },
    {
      id: "headers",
      name: "Headers",
      dataType: "array",
      required: false,
      multiple: false,
      description: "Column headers from CSV",
    },
    {
      id: "rowCount",
      name: "Row Count",
      dataType: "number",
      required: false,
      multiple: false,
      description: "Number of data rows",
    },
  ],
});
