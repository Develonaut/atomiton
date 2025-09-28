import type { NodeDefinition } from '@atomiton/nodes/definitions';
import type { AtomitonFile } from './file.js';

// "Flow" is just what users call a saved node tree
export type FlowFile = AtomitonFile<NodeDefinition>;

export type FlowMetadata = {
  name: string;
  description?: string;
  author?: string;
}
