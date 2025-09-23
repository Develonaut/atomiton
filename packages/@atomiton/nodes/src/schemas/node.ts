import v, { type ZodType } from "@atomiton/validation";
import nodeEdgeSchema from "./nodeEdge";
import nodeMetadataSchema from "./nodeMetadata";
import nodeParametersSchema from "./nodeParameters";
import nodePortSchema from "./nodePort";
import nodePositionSchema from "./nodePosition";
import nodeTypeSchema from "./nodeType";

// Define a recursive schema for nodes that can have children
const nodeSchema: ZodType<any> = v.lazy(() =>
  v.object({
    id: v.string().min(1),
    name: v.string().min(1),
    type: nodeTypeSchema,
    position: nodePositionSchema,
    metadata: nodeMetadataSchema,
    parameters: nodeParametersSchema,
    inputPorts: v.array(nodePortSchema),
    outputPorts: v.array(nodePortSchema),
    edges: v.array(nodeEdgeSchema).optional(),
    children: v.array(nodeSchema).optional(),
  })
);

export default nodeSchema;
