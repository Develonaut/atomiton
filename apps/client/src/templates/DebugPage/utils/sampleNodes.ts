import { createNodeDefinition } from "@atomiton/nodes/definitions";

/**
 * Creates a sample transform node for testing
 */
export function createSampleTransformNode() {
  return createNodeDefinition({
    type: "transform",
    id: "sample_transform",
    parameters: {
      code: "return { result: 'Hello from transform node!' };",
    },
  });
}

/**
 * Creates a sample group node with multiple steps
 */
export function createSampleGroupNode() {
  return createNodeDefinition({
    type: "group",
    id: "sample_group",
    nodes: [
      createNodeDefinition({
        type: "transform",
        id: "step1",
        parameters: {
          code: "return { step: 1, message: 'First step' };",
        },
      }),
      createNodeDefinition({
        type: "transform",
        id: "step2",
        parameters: {
          code: "return { step: 2, message: 'Second step' };",
        },
      }),
    ],
  });
}

/**
 * Creates a test file-system write node
 */
export function createTestWriteNode() {
  const isoTimestamp = new Date().toISOString();
  return createNodeDefinition({
    type: "file-system",
    id: "test_write_file",
    parameters: {
      operation: "write",
      path: ".tmp/test_output.txt",
      content: `Debug test executed at ${isoTimestamp}\n\nTest data: Hello from Debug Page!\n\nThis file was written by the Conductor via IPC.\nTimestamp: ${isoTimestamp}`,
      encoding: "utf8",
      createDirectories: true,
      overwrite: true,
    },
  });
}
