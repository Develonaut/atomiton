/**
 * JSON Serialization Types
 *
 * These types define the JSON format for composite nodes when serialized/deserialized.
 * The JSON format uses flat strings for compatibility with tools like React Flow,
 * while the internal format uses structured objects.
 */

// JSON format for edges - uses flat strings for source/target
export type JsonEdge = {
  id: string;
  source: string; // nodeId as string
  target: string; // nodeId as string
  sourceHandle?: string; // portId
  targetHandle?: string; // portId
  data?: Record<string, unknown>;
};

// JSON format for the entire composite definition
export type JsonCompositeDefinition = {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  metadata?: {
    author?: string;
    tags?: string[];
    icon?: string;
    created?: string;
    updated?: string;
  };
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: Record<string, unknown>;
  }>;
  edges: JsonEdge[];
  variables?: Record<string, unknown>;
  settings?: Record<string, unknown>;
};
