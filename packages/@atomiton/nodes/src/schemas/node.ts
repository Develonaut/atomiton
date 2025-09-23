import v from "@atomiton/validation";
import nodeEdgeSchema from "./nodeEdge";
import nodeMetadataSchema from "./nodeMetadata";
import nodeParametersSchema from "./nodeParameters";
import nodePortSchema from "./nodePort";
import nodePositionSchema from "./nodePosition";
import nodeTypeSchema from "./nodeType";

// Define a recursive schema for nodes that can have children
// TODO: Look into using something declarative instead of any.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeSchema: any = v.lazy(() =>
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
