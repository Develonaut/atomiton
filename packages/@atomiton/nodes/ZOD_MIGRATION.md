# Zod to @atomiton/validation Migration Plan

## Current Zod Usage in @atomiton/nodes

### Schema Definitions

1. **Node Schemas** (`src/schemas/node-schema.ts`)
   - NodeMetadataSchema
   - NodePortDefinitionSchema
   - NodeEdgeSchema
   - NodePositionSchema
   - NodeSettingsSchema
   - NodeSchema

2. **Composite Schemas** (`src/composite/schema.ts`)
   - CompositePositionSchema
   - CompositeNodeDataSchema
   - CompositeEdgeDataSchema
   - CompositeMetadataSchema
   - CompositeVariableSchema
   - CompositeVariablesSchema
   - CompositeSettingsSchema
   - CompositeNodeSpecSchema
   - CompositeEdgeSchema
   - CompositeDefinitionSchema

3. **Parameter Schemas** (All node parameter files)
   - `code/parameters.ts` - Code execution parameters
   - `csv-reader/parameters.ts` - CSV parsing parameters
   - `file-system/parameters.ts` - File operations parameters
   - `http-request/parameters.ts` - HTTP request parameters
   - `image-composite/parameters.ts` - Image processing parameters
   - `loop/parameters.ts` - Loop control parameters
   - `parallel/parameters.ts` - Parallel execution parameters
   - `shell-command/parameters.ts` - Shell command parameters
   - `transform/parameters.ts` - Data transformation parameters

### Zod Types Used

- Basic types: `z.string()`, `z.number()`, `z.boolean()`, `z.array()`, `z.object()`, `z.record()`
- Enums: `z.enum()`
- Unions: `z.union()`
- Optional: `.optional()`
- Default values: `.default()`
- Descriptions: `.describe()`
- Validation: `.min()`, `.max()`, `.url()`, `.datetime()`, `.uuid()`
- Catch-all: `.catchall()`
- Unknown: `z.unknown()`

### Integration Points

- `createAtomicParameters` function uses Zod schemas to generate parameter validation
- `INodeParameters` interface expects Zod schemas
- Composite node validation uses Zod for structure validation

## Migration Strategy

When the `@atomiton/validation` package is created, it should:

1. **Provide equivalent validators for all Zod types**
   - String, number, boolean validators
   - Object and array validators
   - Enum and union validators
   - Optional and default value support
   - Description metadata support

2. **Maintain compatibility with existing APIs**
   - `createAtomicParameters` should work with new validators
   - Schema validation should produce similar error messages
   - Type inference should work the same way

3. **Migration steps:**
   1. Create validation package with Zod-compatible API
   2. Update imports from `zod` to `@atomiton/validation`
   3. Update schema definitions to use new validators
   4. Test all node parameters and composite validation
   5. Remove `zod` dependency from package.json

## Benefits of Migration

- Centralized validation logic
- Consistent validation across all packages
- Potential for custom validation rules specific to Atomiton
- Reduced bundle size if validation package is more lightweight
- Better integration with Atomiton's error handling

## Current Status

✅ Zod is working correctly in the nodes package
⏳ Validation package not yet created
📝 This document serves as a migration guide for when the validation package is ready
