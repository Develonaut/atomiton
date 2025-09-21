# Composite Node Integration Testing - Corrected Approach

## Understanding the Actual Flow

The integration tests have been updated to reflect the **actual runtime flow** rather than testing YAML parsing:

### ❌ Incorrect Approach (Original)
- Testing with YAML template IDs and raw YAML
- Assuming desktop receives YAML directly
- Missing the client-side JSON transformation step

### ✅ Correct Approach (Updated - Factory Pipeline Testing)
1. **Test imports neighboring YAML template** (co-located)
2. **Test uses `fromYaml()` factory** to parse YAML → JSON (like client)
3. **Test sends parsed JSON** to desktop via IPC
4. **Desktop uses `createCompositeNode()` factory** with JSON
5. **Desktop executes** composite workflow through conductor
6. **Test validates** complete factory pipeline integration

## Updated Test Structure - Factory Pipeline Focus

### Factory Pipeline Testing (60% Integration Focus)
Following Bluesky/Vercel approach - test the real factory functions:
```typescript
import { fromYaml } from "../transform/fromYaml";
import helloWorldYaml from "./hello-world.yaml?raw";

// Test the complete factory pipeline the client actually uses
const parseResult = fromYaml(helloWorldYaml);
const helloWorldDefinition = parseResult.data;

const result = await sendNodeExecuteRequest(electronApp, "composite", {
  definition: helloWorldDefinition,  // Parsed through actual factory
  useFactoryPipeline: true,          // Test createCompositeNode factory
  inputs: {},
});
```

### Individual Node Testing
Still test atomic nodes for completeness:
```typescript
// Test the actual "code" node that would be in the composite
const result = await sendNodeExecuteRequest(electronApp, "code", {
  code: "const greeting = 'Hello, World!';\nreturn { message: greeting };",
  inputParams: "data",
  returnType: "object",
  async: false,
});
```

## Key Insights

### 1. **YAML vs Runtime Separation**
- **YAML**: Persistence/storage format for templates
- **JSON**: Runtime execution format
- **Tests should focus on runtime execution flow**

### 2. **Client-Desktop Communication**
- Client processes YAML → JSON transformation
- Desktop receives structured JSON composite definitions
- IPC carries JSON payloads, not YAML strings

### 3. **Integration Test Scope**
- Test `createCompositeNode()` factory with JSON input
- Test composite workflow execution through conductor
- Test individual atomic nodes that compose the workflow
- Test edge cases, error handling, graceful degradation

### 4. **Future Edge Case Testing Areas**
As mentioned, composite nodes are where we want to test:
- **Hanging nodes**: Timeout handling in workflow execution
- **Failed nodes**: Error propagation and recovery
- **Resource exhaustion**: Memory/CPU limits during complex workflows
- **Invalid connections**: Malformed edge definitions
- **Circular dependencies**: Detection and prevention
- **Partial failures**: When some nodes succeed and others fail

## Templates Structure
Each template now has:
- `template-name.yaml` - YAML template definition (persistence)
- `template-name.integration.test.ts` - JSON-based runtime testing (execution)

This separation clarifies the distinction between storage format and execution format, ensuring tests validate the actual runtime behavior users will experience.