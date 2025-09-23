import v from "@atomiton/validation";

const nodeEdgeSchema = v.object({
  id: v.string().min(1),
  source: v.string().min(1),
  target: v.string().min(1),
  sourceHandle: v.string().nullable().optional(),
  targetHandle: v.string().nullable().optional(),
  type: v.string().optional(),
  animated: v.boolean().optional(),
  hidden: v.boolean().optional(),
  deletable: v.boolean().optional(),
  selectable: v.boolean().optional(),
  data: v.record(v.unknown()).optional(),
  selected: v.boolean().optional(),
  zIndex: v.number().optional(),
  ariaLabel: v.string().optional(),
});

export default nodeEdgeSchema;
