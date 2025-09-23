import v from "@atomiton/validation";

const nodePortSchema = v.object({
  id  : v.string().min(1),
  name: v.string().min(1),
  type: v.union([
    v.literal("input"),
    v.literal("output"),
    v.literal("trigger"),
    v.literal("error"),
  ]),
  dataType    : v.string().min(1),
  required    : v.boolean().optional(),
  multiple    : v.boolean().optional(),
  description : v.string().optional(),
  defaultValue: v.unknown().optional(),
});

export default nodePortSchema;
