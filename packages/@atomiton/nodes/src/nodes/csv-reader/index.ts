/**
 * CSV Reader Node
 *
 * Node for reading CSV files and spreadsheet data
 */

import { createNode } from "../../base/createNode";
import { csvReaderParameters } from "./parameters";
import { csvReaderLogic } from "./logic";
import { csvReaderMetadata } from "./metadata";
import { csvReaderPorts } from "./ports";

export const csvReader = createNode({
  metadata: csvReaderMetadata,
  parameters: csvReaderParameters,
  logic: csvReaderLogic,
  ports: csvReaderPorts,
});

export default csvReader;
