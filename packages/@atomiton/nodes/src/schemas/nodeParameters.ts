import v from "@atomiton/validation";

const nodeParametersSchema = v.object({
  schema: v.any(),
  defaults: v.record(v.unknown()),
  fields: v.record(v.unknown()),
  parse: v.any(),
  parsePartial: v.any(),
  withDefaults: v.any(),
  zodSchema: v.any(),
});

export default nodeParametersSchema;
