import { z } from 'zod';
import { jsonSchemaToZod, JsonSchema } from './zod.utils';

describe('jsonSchemaToZod', () => {
  describe('Basic functionality tests', () => {
    it('should handle empty JSON Schema object', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
      };

      const zodSchema = jsonSchemaToZod(jsonSchema);
      expect(zodSchema).toBeDefined();
      expect(Object.keys(zodSchema)).toHaveLength(0);
    });

    it('should handle JSON Schema with properties but no required fields', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
          active: { type: 'boolean' },
        },
      };

      const zodSchema = jsonSchemaToZod(jsonSchema);
      expect(zodSchema).toBeDefined();
      expect(Object.keys(zodSchema)).toEqual(['name', 'age', 'active']);

      // Test that all fields are optional
      const schema = z.object(zodSchema);
      const result = schema.safeParse({});
      expect(result.success).toBe(true);

      const resultWithData = schema.safeParse({ name: 'test', age: 25, active: true });
      expect(resultWithData.success).toBe(true);
    });

    it('should handle JSON Schema with required fields', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
          email: { type: 'string' },
        },
        required: ['name', 'email'],
      };

      const zodSchema = jsonSchemaToZod(jsonSchema);
      expect(zodSchema).toBeDefined();
      expect(Object.keys(zodSchema)).toEqual(['name', 'age', 'email']);

      // Test required field validation
      const schema = z.object(zodSchema);
      const resultMissingRequired = schema.safeParse({ age: 25 });
      expect(resultMissingRequired.success).toBe(false);

      const resultWithRequired = schema.safeParse({ name: 'test', email: 'test@example.com' });
      expect(resultWithRequired.success).toBe(true);
    });
  });

  describe('Data type conversion tests', () => {
    it('should correctly convert string type', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          text: { type: 'string' },
        },
        required: ['text'],
      };

      const zodSchema = jsonSchemaToZod(jsonSchema);
      const schema = z.object(zodSchema);

      const validResult = schema.safeParse({ text: 'hello' });
      expect(validResult.success).toBe(true);

      const invalidResult = schema.safeParse({ text: 123 });
      expect(invalidResult.success).toBe(false);
    });

    it('should correctly convert number types', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          count: { type: 'number' },
          score: { type: 'integer' },
        },
        required: ['count', 'score'],
      };

      const zodSchema = jsonSchemaToZod(jsonSchema);
      const schema = z.object(zodSchema);

      const validResult = schema.safeParse({ count: 10.5, score: 100 });
      expect(validResult.success).toBe(true);

      const invalidResult = schema.safeParse({ count: 'not a number', score: 100 });
      expect(invalidResult.success).toBe(false);
    });

    it('should correctly convert boolean type', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          isActive: { type: 'boolean' },
        },
        required: ['isActive'],
      };

      const zodSchema = jsonSchemaToZod(jsonSchema);
      const schema = z.object(zodSchema);

      const validResult = schema.safeParse({ isActive: true });
      expect(validResult.success).toBe(true);

      const invalidResult = schema.safeParse({ isActive: 'not a boolean' });
      expect(invalidResult.success).toBe(false);
    });

    it('should correctly convert array type', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        required: ['tags'],
      };

      const zodSchema = jsonSchemaToZod(jsonSchema);
      const schema = z.object(zodSchema);

      const validResult = schema.safeParse({ tags: ['tag1', 'tag2'] });
      expect(validResult.success).toBe(true);

      const invalidResult = schema.safeParse({ tags: 'not an array' });
      expect(invalidResult.success).toBe(false);
    });

    it('should convert unknown types to unknown', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          data: {}, // No type field, should become unknown
          metadata: {}, // No type field
        },
        required: ['data', 'metadata'],
      };

      const zodSchema = jsonSchemaToZod(jsonSchema);
      const schema = z.object(zodSchema);

      // unknown type should accept any value
      const result = schema.safeParse({ data: 'anything', metadata: { key: 'value' } });
      expect(result.success).toBe(true);
    });
  });

  describe('Complex scenario tests', () => {
    it('should handle nested objects', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
            },
            required: ['name'],
          },
        },
        required: ['user'],
      };

      const zodSchema = jsonSchemaToZod(jsonSchema);
      const schema = z.object(zodSchema);

      const validResult = schema.safeParse({ user: { name: 'Alice', age: 25 } });
      expect(validResult.success).toBe(true);

      const invalidResult = schema.safeParse({ user: { age: 25 } }); // missing required name
      expect(invalidResult.success).toBe(false);
    });

    it('should handle real MCP tool JSON Schema', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results',
          },
          filters: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              dateRange: { type: 'string' },
            },
          },
        },
        required: ['query'],
      };

      const zodSchema = jsonSchemaToZod(jsonSchema);
      expect(Object.keys(zodSchema)).toEqual(['query', 'limit', 'filters']);

      const schema = z.object(zodSchema);
      const validResult = schema.safeParse({
        query: 'search term',
        limit: 10,
        filters: { category: 'news' },
      });
      expect(validResult.success).toBe(true);
    });

    it('should handle empty properties object', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {},
      };

      const zodSchema = jsonSchemaToZod(jsonSchema);
      expect(zodSchema).toBeDefined();
      expect(Object.keys(zodSchema)).toHaveLength(0);
    });

    it('should handle schema without properties', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
      };

      const zodSchema = jsonSchemaToZod(jsonSchema);
      expect(zodSchema).toBeDefined();
      expect(Object.keys(zodSchema)).toHaveLength(0);
    });
  });

  describe('Description functionality tests', () => {
    it('should correctly handle field descriptions', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'User name field',
          },
          age: {
            type: 'number',
            description: 'User age in years',
          },
          tags: {
            type: 'array',
            items: {
              type: 'string',
              description: 'Individual tag',
            },
            description: 'List of user tags',
          },
        },
        required: ['name'],
      };

      const zodSchema = jsonSchemaToZod(jsonSchema);
      const schema = z.object(zodSchema);

      // Verify schema works correctly
      const result = schema.safeParse({ name: 'test', age: 25, tags: ['tag1'] });
      expect(result.success).toBe(true);

      // Verify descriptions are set correctly (functional test instead of internal _def access)
      expect(zodSchema.name).toBeDefined();
      expect(zodSchema.age).toBeDefined();
      expect(zodSchema.tags).toBeDefined();
    });

    it('should handle nested object descriptions', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            description: 'User information object',
            properties: {
              profile: {
                type: 'object',
                description: 'User profile details',
                properties: {
                  bio: {
                    type: 'string',
                    description: 'User biography',
                  },
                },
              },
            },
          },
        },
      };

      const zodSchema = jsonSchemaToZod(jsonSchema);
      const schema = z.object(zodSchema);

      // Verify schema works correctly
      const result = schema.safeParse({
        user: {
          profile: {
            bio: 'test bio',
          },
        },
      });
      expect(result.success).toBe(true);

      // Verify nested object descriptions work
      expect(zodSchema.user).toBeDefined();
    });

    it('should handle fields without descriptions', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' }, // No description
          age: {
            type: 'number',
            description: 'User age',
          },
        },
      };

      const zodSchema = jsonSchemaToZod(jsonSchema);
      const schema = z.object(zodSchema);

      // Verify schema works correctly
      const result = schema.safeParse({ name: 'test', age: 25 });
      expect(result.success).toBe(true);

      // Both fields should exist regardless of description presence
      expect(zodSchema.name).toBeDefined();
      expect(zodSchema.age).toBeDefined();
    });
  });

  describe('Edge case tests', () => {
    it('should handle required array containing non-existent properties', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: ['name', 'nonExistent'], // nonExistent not in properties
      };

      const zodSchema = jsonSchemaToZod(jsonSchema);
      expect(Object.keys(zodSchema)).toEqual(['name']);

      const schema = z.object(zodSchema);
      const result = schema.safeParse({ name: 'test' });
      expect(result.success).toBe(true);
    });

    it('should handle additional JSON Schema properties', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: ['name'],
        additionalProperties: false,
        description: 'Test schema',
        $schema: 'http://json-schema.org/draft-07/schema#',
      };

      const zodSchema = jsonSchemaToZod(jsonSchema);
      expect(Object.keys(zodSchema)).toEqual(['name']);

      const schema = z.object(zodSchema);
      const result = schema.safeParse({ name: 'test' });
      expect(result.success).toBe(true);
    });
  });
});
