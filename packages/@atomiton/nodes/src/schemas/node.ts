import type { VInfer, VType } from "@atomiton/validation";
import v from "@atomiton/validation";
import nodeEdgeSchema from "#schemas/nodeEdge";
import nodeMetadataSchema from "#schemas/nodeMetadata";
import nodeParametersSchema from "#schemas/nodeParameters";
import nodePortSchema from "#schemas/nodePort";
import nodePositionSchema from "#schemas/nodePosition";

// Create a base node schema without children for type inference
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

// Define the full node type with recursive children
export type NodeSchemaType = BaseNode & {
  children?: NodeSchemaType[];
};

// Define a recursive schema for nodes that can have children
// The schema properly validates the recursive structure
const nodeSchema: VType<NodeSchemaType> = v.lazy(
  () =>
    baseNodeSchema.extend({
      children: v.array(nodeSchema).optional(),
    }) as VType<NodeSchemaType>,
);

export default nodeSchema;
