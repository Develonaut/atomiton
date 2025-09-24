import v from "@atomiton/validation";

const nodePositionSchema = v.object({
  x: v.number(),
  y: v.number(),
});

export default nodePositionSchema;
