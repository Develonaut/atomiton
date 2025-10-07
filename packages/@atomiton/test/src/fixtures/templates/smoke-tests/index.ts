/**
 * Smoke Test Index
 * Aggregates all node-specific smoke tests into a single export
 */

import { editFieldsSmokeTests } from "./edit-fields.js";
import { fileSystemSmokeTests } from "./file-system.js";
import { groupSmokeTests } from "./group.js";
import { httpRequestSmokeTests } from "./http-request.js";
import { imageSmokeTests } from "./image.js";
import { loopSmokeTests } from "./loop.js";
import { parallelSmokeTests } from "./parallel.js";
import { shellCommandSmokeTests } from "./shell-command.js";
import { spreadsheetSmokeTests } from "./spreadsheet.js";
import { transformSmokeTests } from "./transform.js";

export type SmokeTest = {
  name: string;
  config: Record<string, unknown>;
};

export type NodeSmokeTests = Record<string, SmokeTest[]>;

/**
 * Smoke test configurations per node type
 * Each node type has its own file in the smoke-tests directory
 */
export const nodeSmokeTests: NodeSmokeTests = {
  loop: loopSmokeTests,
  group: groupSmokeTests,
  parallel: parallelSmokeTests,
  "edit-fields": editFieldsSmokeTests,
  "file-system": fileSystemSmokeTests,
  "http-request": httpRequestSmokeTests,
  image: imageSmokeTests,
  "shell-command": shellCommandSmokeTests,
  spreadsheet: spreadsheetSmokeTests,
  transform: transformSmokeTests,
};
