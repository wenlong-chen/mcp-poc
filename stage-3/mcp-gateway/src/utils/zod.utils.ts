import { z, ZodRawShape, ZodTypeAny } from 'zod';

/**
 * JSON Schema type definition based on MCP protocol inputSchema definition.
 * Supports the passthrough() functionality for additional properties.
 */
export interface JsonSchema {
  type: 'object';
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  [key: string]: unknown; // Allow additional properties (passthrough support)
}

/**
 * JSON Schema property definition with support for nested structures.
 */
export interface JsonSchemaProperty {
  type?: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  description?: string;
  [key: string]: unknown; // Allow additional properties
}

/**
 * Converts a JSON Schema object to a Zod RawShape.
 *
 * @param jsonSchema - The JSON Schema object to convert
 * @returns Zod RawShape object that can be used with z.object()
 *
 * @example
 * ```typescript
 * const schema: JsonSchema = {
 *   type: 'object',
 *   properties: {
 *     name: { type: 'string', description: 'User name' },
 *     age: { type: 'number' }
 *   },
 *   required: ['name']
 * };
 *
 * const zodShape = jsonSchemaToZod(schema);
 * const zodSchema = z.object(zodShape);
 * ```
 */
export const jsonSchemaToZod = (jsonSchema: JsonSchema): ZodRawShape => {
  const shape: ZodRawShape = {};

  // Return empty shape if no properties are defined
  if (!jsonSchema.properties) {
    return shape;
  }

  const requiredFields = new Set(jsonSchema.required ?? []);

  // Convert each property to corresponding Zod type
  for (const [key, property] of Object.entries(jsonSchema.properties)) {
    let zodType: ZodTypeAny = convertPropertyToZodType(property);

    // Add description if provided
    if (property.description) {
      zodType = zodType.describe(property.description);
    }

    // Make field optional if not in required list
    if (!requiredFields.has(key)) {
      zodType = zodType.optional();
    }

    shape[key] = zodType;
  }

  return shape;
};

/**
 * Helper function to convert a single JSON Schema property to a Zod type.
 * Handles recursive conversion for nested objects and arrays.
 *
 * @param property - The JSON Schema property to convert
 * @returns The corresponding Zod type
 */
function convertPropertyToZodType(property: JsonSchemaProperty): ZodTypeAny {
  let zodType: ZodTypeAny;

  switch (property.type) {
    case 'string':
      zodType = z.string();
      break;
    case 'number':
    case 'integer':
      zodType = z.number();
      break;
    case 'boolean':
      zodType = z.boolean();
      break;
    case 'array':
      if (property.items) {
        const itemType = convertPropertyToZodType(property.items);
        zodType = z.array(itemType);
      } else {
        zodType = z.array(z.unknown());
      }
      break;
    case 'object':
      if (property.properties) {
        const nestedSchema: JsonSchema = {
          type: 'object',
          properties: property.properties,
          ...(property.required && { required: property.required }),
        };
        const nestedShape = jsonSchemaToZod(nestedSchema);
        zodType = z.object(nestedShape);
      } else {
        zodType = z.object({}).passthrough();
      }
      break;
    default:
      // For unknown types or properties without type, use unknown instead of any
      zodType = z.unknown();
      break;
  }

  // Add description if provided
  if (property.description) {
    zodType = zodType.describe(property.description);
  }

  return zodType;
}
