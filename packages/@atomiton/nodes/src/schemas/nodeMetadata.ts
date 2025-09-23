import v from "@atomiton/validation";

const nodeMetadataSchema = v.object({
  id: v.string().min(1),
  name: v.string().min(1),
  variant: v.string().min(1),
  version: v.string().min(1),
  author: v.string().min(1),
  authorId: v.string().optional(),
  description: v.string().min(1),
  category: v.string().min(1),
  icon: v.string().min(1),
  source: v.string().optional(),
  keywords: v.array(v.string()).optional(),
  tags: v.array(v.string()).optional(),
  runtime: v
    .object({
      language: v.string().min(1),
    })
    .optional(),
  experimental: v.boolean().optional(),
  deprecated: v.boolean().optional(),
  documentationUrl: v.string().optional(),
  examples: v
    .array(
      v.object({
        name: v.string(),
        description: v.string(),
        config: v.record(v.unknown()),
      }),
    )
    .optional(),
});

export default nodeMetadataSchema;
