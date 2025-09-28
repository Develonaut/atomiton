import type { NodeDefinition } from '@atomiton/nodes/definitions';
import type { FlowFile, FlowMetadata } from './types/flowFile.js';
import { promises as fs } from 'fs';
import yaml from 'js-yaml';
import path from 'path';

export async function saveFlowFile(
  filePath: string,
  node: NodeDefinition,
  metadata: FlowMetadata & { createdAt?: Date }
): Promise<void> {
  const file: FlowFile = {
    version: '1.0.0',
    metadata: {
      ...metadata,
      createdAt: metadata.createdAt || new Date(),
      updatedAt: new Date(),
    },
    data: node,
  };

  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });

  const yamlContent = yaml.dump(file, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
  });

  await fs.writeFile(filePath, yamlContent, 'utf-8');
}

export async function loadFlowFile(filePath: string): Promise<NodeDefinition> {
  const content = await fs.readFile(filePath, 'utf-8');
  const file = yaml.load(content) as FlowFile;
  return file.data; // Just return the node tree
}