import type { VInfer, VType } from "@atomiton/validation";
import v from "@atomiton/validation";
import nodeEdgeSchema from "#schemas/node/edge";
import nodeMetadataSchema from "#schemas/node/metadata";
import nodeParametersSchema from "#schemas/node/parameters";
import nodePortSchema from "#schemas/node/port";
import nodePositionSchema from "#schemas/node/position";

// Create a base node schema without nodes for type inference
const baseNodeSchema = v.object({
  id: v.string().min(1),
  name: v.string().min(1),
  position: nodePositionSchema,
  metadata: nodeMetadataSchema,
  parameters: nodeParametersSchema,
  inputPorts: v.array(nodePortSchema),
  outputPorts: v.array(nodePortSchema),
  edges: v.array(nodeEdgeSchema).optional(),
});

// Infer the base node type
type BaseNode = VInfer<typeof baseNodeSchema>;

// Define the full node type with recursive nodes
export type NodeSchemaType = BaseNode & {
  nodes?: NodeSchemaType[];
};

// Define a recursive schema for nodes that can have nodes
// The schema properly validates the recursive structure
const nodeSchema: VType<NodeSchemaType> = v.lazy(
  () =>
    baseNodeSchema.extend({
      nodes: v.array(nodeSchema).optional(),
    }) as VType<NodeSchemaType>,
);

export default nodeSchema;
