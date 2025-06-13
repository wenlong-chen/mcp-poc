# JSON Schema to Zod Utility

This utility converts MCP protocol JSON Schema objects to Zod validation schemas.

## Features

- **Type-safe conversion**: Full TypeScript support with proper type inference
- **MCP protocol compliant**: Designed specifically for MCP tool input schemas
- **Description preservation**: Maintains field descriptions from JSON Schema
- **Nested structure support**: Handles objects and arrays with recursive conversion
- **Required field handling**: Automatically makes non-required fields optional
- **Fallback support**: Uses `z.unknown()` for unknown types instead of `any`

## Usage

```typescript
import { z } from 'zod';
import { jsonSchemaToZod, JsonSchema } from './zod.utils';

const schema: JsonSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'User name' },
    age: { type: 'number' },
    tags: { 
      type: 'array', 
      items: { type: 'string' }
    }
  },
  required: ['name']
};

const zodShape = jsonSchemaToZod(schema);
const zodSchema = z.object(zodShape);

// Use for validation
const result = zodSchema.safeParse({ name: 'Alice', age: 25 });
```

## Testing

Run the comprehensive test suite:

```bash
npm test src/utils/zod.utils.spec.ts
```

The test suite includes 17 tests covering:
- Basic functionality
- Data type conversions (string, number, boolean, array, object)
- Complex scenarios (nested objects, real MCP schemas)
- Description handling
- Edge cases

## Type Safety

The utility maintains strict type safety:
- No use of `any` types
- Proper error handling for unknown types
- Type guards for validation
- Full TypeScript strictness compliance 