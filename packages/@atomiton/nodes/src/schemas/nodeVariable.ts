import v from "@atomiton/validation";

const nodeVariableSchema = v.object({
  type        : v.string().min(1),
  defaultValue: v.unknown().optional(),
  description : v.string().optional(),
});

export default nodeVariableSchema;
