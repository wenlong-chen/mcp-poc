import { ToolAnnotations } from '@modelcontextprotocol/sdk/types';
import { ZodRawShape } from 'zod';

export interface RegisteredTool {
  name: string;
  config: {
    description?: string;
    inputSchema?: ZodRawShape;
    outputSchema?: ZodRawShape;
    annotations?: ToolAnnotations;
  };
  serviceUrl: string;
  originalToolName: string;
}
