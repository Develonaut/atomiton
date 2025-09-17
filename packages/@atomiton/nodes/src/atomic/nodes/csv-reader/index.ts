/**
 * CSV Reader Node
 *
 * Node for reading CSV files and spreadsheet data
 */

import { createAtomicNode } from "../../createAtomicNode";
import { csvReaderParameters } from "./parameters";
import { csvReaderExecutable } from "./executable";
import { csvReaderMetadata } from "./metadata";
import { csvReaderPorts } from "./ports";

export const csvReader = createAtomicNode({
  metadata: csvReaderMetadata,
  parameters: csvReaderParameters,
  executable: csvReaderExecutable,
  ports: csvReaderPorts,
});

export default csvReader;
