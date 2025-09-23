import v, { type VParseResult, type VType } from "@atomiton/validation";

const nodeParametersSchema = v.object({
  schema: v.custom<VType<Record<string, unknown>>>(),
  defaults: v.record(v.unknown()),
  fields: v.record(v.unknown()),
  parse: v.function().args(v.unknown()).returns(v.unknown()),
  safeParse: v
    .function()
    .args(v.unknown())
    .returns(v.custom<VParseResult<unknown>>()),
  isValid: v.function().args(v.unknown()).returns(v.boolean()),
  withDefaults: v.function().args(v.unknown().optional()).returns(v.unknown()),
});

export default nodeParametersSchema;
