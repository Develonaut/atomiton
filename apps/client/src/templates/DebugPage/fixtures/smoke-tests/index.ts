/**
 * Smoke Test Index
 * Aggregates all node-specific smoke tests into a single export
 */

import { editFieldsSmokeTests } from "#templates/DebugPage/fixtures/smoke-tests/edit-fields";
import { fileSystemSmokeTests } from "#templates/DebugPage/fixtures/smoke-tests/file-system";
import { groupSmokeTests } from "#templates/DebugPage/fixtures/smoke-tests/group";
import { httpRequestSmokeTests } from "#templates/DebugPage/fixtures/smoke-tests/http-request";
import { imageSmokeTests } from "#templates/DebugPage/fixtures/smoke-tests/image";
import { loopSmokeTests } from "#templates/DebugPage/fixtures/smoke-tests/loop";
import { parallelSmokeTests } from "#templates/DebugPage/fixtures/smoke-tests/parallel";
import { shellCommandSmokeTests } from "#templates/DebugPage/fixtures/smoke-tests/shell-command";
import { spreadsheetSmokeTests } from "#templates/DebugPage/fixtures/smoke-tests/spreadsheet";
import { transformSmokeTests } from "#templates/DebugPage/fixtures/smoke-tests/transform";

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
