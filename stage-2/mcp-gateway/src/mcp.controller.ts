import { Controller, Post, Req, Res, OnModuleInit } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import z from 'zod';
import axios from 'axios';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { Request, Response } from 'express';

interface OpenAPIParameter {
  name: string;
  in: string;
  required?: boolean;
  schema?: {
    type: string;
    description?: string;
  };
}

interface OpenAPIOperation {
  operationId?: string;
  summary?: string;
  description?: string;
  parameters?: OpenAPIParameter[];
}

interface OpenAPISpec {
  paths: {
    [path: string]: {
      [method: string]: OpenAPIOperation;
    };
  };
}

interface ToolDefinition {
  name: string;
  description: string;
  parameters: { [key: string]: z.ZodType };
  handler: (params: any) => Promise<CallToolResult>;
}

@Controller('mcp')
export class McpController implements OnModuleInit {
  private toolDefinitions: ToolDefinition[] = [];

  async onModuleInit() {
    console.log('Loading OpenAPI specifications...');
    await this.loadOpenAPISpecs();
  }

  private async loadOpenAPISpecs() {
    const services = [
      {
        name: 'shopping-service',
        url: process.env.SHOPPING_SERVICE_URL || 'http://localhost:3002',
      },
      {
        name: 'user-service',
        url: process.env.USER_SERVICE_URL || 'http://localhost:3003',
      },
    ];

    for (const service of services) {
      try {
        await this.loadServiceOpenAPI(service.name, service.url);
      } catch (error: unknown) {
        console.error(`Failed to load OpenAPI from ${service.name}:`, error);
      }
    }

    console.log(`Loaded ${this.toolDefinitions.length} tool definitions`);
  }

  private async loadServiceOpenAPI(serviceName: string, serviceUrl: string) {
    try {
      console.log(`Fetching OpenAPI spec from ${serviceName} at ${serviceUrl}/api-json`);
      const response = await axios.get(`${serviceUrl}/api-json`);
      const spec: OpenAPISpec = response.data as OpenAPISpec;

      this.generateToolsFromOpenAPI(serviceName, serviceUrl, spec);
      console.log(`Successfully loaded OpenAPI spec from ${serviceName}`);
    } catch (error) {
      console.log(`OpenAPI not available for ${serviceName}, using fallback`);
      throw error;
    }
  }

  private generateToolsFromOpenAPI(serviceName: string, serviceUrl: string, spec: OpenAPISpec) {
    for (const [path, pathItem] of Object.entries(spec.paths)) {
      // Skip root path and other non-business endpoints
      if (path === '/' || path.includes('health') || path.includes('api-docs')) {
        continue;
      }
      for (const [method, operation] of Object.entries(pathItem)) {
        if (method.toLowerCase() === 'get') {
          const toolDef = this.createToolFromOperation(serviceName, serviceUrl, path, method, operation);
          this.toolDefinitions.push(toolDef);
        }
      }
    }
  }

  private createToolFromOperation(
    serviceName: string,
    serviceUrl: string,
    path: string,
    method: string,
    operation: OpenAPIOperation,
  ): ToolDefinition {
    // Extract path parameters
    const pathParams = operation.parameters?.filter((p) => p.in === 'path') || [];

    // Create zod schema for parameters
    const schemaFields: { [key: string]: z.ZodType } = {};
    pathParams.forEach((param) => {
      if (param.schema?.type === 'string') {
        schemaFields[param.name] = z.string().describe(param.schema.description || param.name);
      }
    });

    // Use operationId if available, otherwise fall back to path-based naming
    // Always prefix with service name to ensure uniqueness
    const toolName = operation.operationId
      ? `${serviceName}-${operation.operationId}`
      : `${serviceName}-${path.replace(/[^a-zA-Z0-9]/g, '-').replace(/--+/g, '-')}`;
    const toolDescription = operation.summary || operation.description || `Call ${method.toUpperCase()} ${path}`;

    return {
      name: toolName,
      description: toolDescription,
      parameters: schemaFields,
      handler: async (params: Record<string, string>): Promise<CallToolResult> => {
        try {
          let requestPath = path;
          // Replace path parameters
          for (const param of pathParams) {
            requestPath = requestPath.replace(`{${param.name}}`, params[param.name]);
          }

          const response = await axios.get(`${serviceUrl}${requestPath}`);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(response.data, null, 2),
              },
            ],
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [
              {
                type: 'text',
                text: `Error calling ${serviceName} API: ${errorMessage}`,
              },
            ],
            isError: true,
          };
        }
      },
    };
  }

  private createServer(): McpServer {
    const server = new McpServer(
      {
        name: 'dynamic-mcp-gateway',
        version: '2.0.0',
      },
      { capabilities: { logging: {} } },
    );

    // Add all loaded tools to the server
    this.toolDefinitions.forEach((toolDef) => {
      server.tool(toolDef.name, toolDef.description, toolDef.parameters, toolDef.handler);
    });

    return server;
  }

  @Post()
  async handleMcpRequest(@Req() req: Request, @Res() res: Response) {
    try {
      const server = this.createServer();
      const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });

      res.on('close', () => {
        void transport.close();
        void server.close();
      });

      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: null,
        });
      }
    }
  }
}
