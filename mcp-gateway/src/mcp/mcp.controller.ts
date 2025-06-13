import { Controller, Post, Req, Res, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { z } from 'zod';
import { RegistryService } from '../registry/registry.service';
import { jsonSchemaToZod, JsonSchema } from '../utils/zod.utils';

interface ServiceWithTools {
  id: string;
  name: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  tools: Tool[];
}

interface Tool {
  name: string;
  description?: string;
  inputSchema?: any;
}

@Controller('mcp')
export class McpController {
  private readonly logger = new Logger(McpController.name);

  constructor(private readonly registryService: RegistryService) {
    this.logger.log('McpController constructor called!');
  }

  @Post()
  async handleMcpRequest(@Req() req: Request, @Res() res: Response) {
    try {
      this.logger.log('Handling MCP request...');

      // Load services and tools from database
      const servicesWithTools = await this.registryService.getAllServicesWithTools();
      
      const server = this.createServerWithTools(servicesWithTools);

      this.logger.log(`Created server with ${servicesWithTools.length} services`);

      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });

      res.on('close', () => {
        void transport.close();
        void server.close();
      });

      await server.connect(transport as Parameters<typeof server.connect>[0]);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      this.logger.error('Error handling MCP request:', error);

      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: error instanceof Error ? error.message : 'Internal server error',
          },
          id: null,
        });
      }
    }
  }

  private createServerWithTools(servicesWithTools: ServiceWithTools[]): McpServer {
    const server = new McpServer(
      {
        name: 'mcp-federation-gateway',
        version: '3.1.0',
      },
      { capabilities: { logging: {} } },
    );

    // Add a test tool to verify server functionality
    server.tool(
      'test-tool',
      'A simple test tool to verify server functionality',
      (): CallToolResult => ({
        content: [
          {
            type: 'text',
            text: `MCP Gateway is working! Connected services: ${servicesWithTools.length}`,
          },
        ],
      }),
    );

    // Register tools from all services
    for (const service of servicesWithTools) {
      this.registerServiceTools(server, service, servicesWithTools);
    }

    return server;
  }

  private registerServiceTools(
    server: McpServer,
    service: ServiceWithTools,
    allServices: ServiceWithTools[],
  ): void {
    const tools = service.tools || [];

    for (const tool of tools) {
      const toolName = `${service.name}.${tool.name}`;

      this.logger.log(`Registering tool: ${toolName}`);

      try {
        // Debug: Print original JSON Schema
        this.logger.log(`=== DEBUGGING ${toolName} ===`);
        this.logger.log(`Original JSON inputSchema:`, JSON.stringify(tool.inputSchema, null, 2));
        
        // Convert JSON Schema to Zod schema
        const inputSchema = this.convertInputSchemaToZod(tool.inputSchema);
        
        // Debug: Print converted Zod schema
        this.logger.log(`Converted Zod inputSchema:`, JSON.stringify(inputSchema, null, 2));
        if (inputSchema) {
          this.logger.log(`Zod inputSchema keys:`, Object.keys(inputSchema));
          for (const [key, value] of Object.entries(inputSchema)) {
            this.logger.log(`  ${key}:`, value?.constructor?.name || 'unknown');
          }
        }

        const toolConfig: {
          description: string;
          inputSchema?: Record<string, z.ZodTypeAny>;
        } = {
          description: tool.description || `Tool ${tool.name} from ${service.name}`,
        };

        if (inputSchema) {
          toolConfig.inputSchema = inputSchema;
        }
        
        this.logger.log(`Final toolConfig:`, JSON.stringify({
          description: toolConfig.description,
          hasInputSchema: !!toolConfig.inputSchema,
          inputSchemaKeys: toolConfig.inputSchema ? Object.keys(toolConfig.inputSchema) : []
        }, null, 2));

        server.registerTool(toolName, toolConfig, async (params: unknown): Promise<CallToolResult> => {
          try {
            // Find the target service
            const targetService = allServices.find((s) => s.name === service.name);
            if (!targetService) {
              return {
                content: [
                  {
                    type: 'text',
                    text: `Error: Service for tool ${toolName} not found`,
                  },
                ],
                isError: true,
              };
            }

            this.logger.log(`Forwarding tool call ${toolName} to service ${targetService.url}`);
            this.logger.log(`Tool call params received:`, JSON.stringify(params, null, 2));

            // Create client to connect to the target service
            const client = new Client({
              name: 'mcp-gateway-client',
              version: '3.1.0',
            });

            const transport = new StreamableHTTPClientTransport(
              new URL(`${targetService.url}/mcp`),
            );

            await client.connect(transport as Parameters<typeof client.connect>[0]);

            try {
              // Forward the tool call to the actual service
              const result = await client.callTool({
                name: tool.name, // Use original tool name without service prefix
                arguments: (params as Record<string, unknown>) || {},
              });

              this.logger.log(`Tool call ${toolName} completed successfully`);
              this.logger.log(`Tool call result:`, JSON.stringify(result, null, 2));

              // Return the result directly - MCP SDK ensures compatibility
              return result as CallToolResult;
            } finally {
              await client.close();
            }
          } catch (error) {
            this.logger.error(`Error forwarding tool call ${toolName}:`, error);
            return {
              content: [
                {
                  type: 'text',
                  text: `Error forwarding tool call: ${error instanceof Error ? error.message : 'Unknown error'}`,
                },
              ],
              isError: true,
            };
          }
        });

        this.logger.log(`Successfully registered tool: ${toolName}`);
      } catch (error) {
        this.logger.error(`Failed to register tool ${toolName}:`, error);
      }
    }
  }

  /**
   * Convert JSON Schema to Zod schema for MCP tool registration
   */
  private convertInputSchemaToZod(
    inputSchema: unknown,
  ): Record<string, z.ZodTypeAny> | undefined {
    if (!inputSchema || typeof inputSchema !== 'object') {
      return undefined;
    }

    try {
      // Type assertion is safe here because we've checked the structure
      const schema = inputSchema as JsonSchema;

      // Validate that it's a proper object schema
      if (schema.type !== 'object') {
        this.logger.warn('Input schema is not of type "object", skipping schema conversion');
        return undefined;
      }

      return jsonSchemaToZod(schema);
    } catch (error) {
      this.logger.warn('Failed to convert JSON Schema to Zod:', error);
      return undefined;
    }
  }
} 