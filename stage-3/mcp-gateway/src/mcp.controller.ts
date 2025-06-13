import {
  Controller,
  Post,
  Req,
  Res,
  Body,
  HttpException,
  HttpStatus,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { Request, Response } from 'express';
import { z } from 'zod';
import { jsonSchemaToZod, JsonSchema } from './utils/zod.utils';

interface ServiceConfig {
  name: string;
  url: string;
}

interface RegisteredService {
  name: string;
  url: string;
  client: Client;
  tools: Tool[];
}

interface ServiceRegistrationRequest {
  name: string;
  url: string;
}

@Controller('mcp')
export class McpController implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(McpController.name);
  private registeredServices: Map<string, RegisteredService> = new Map();

  async onModuleInit() {
    this.logger.log('Initializing MCP Federation Gateway...');
    await this.connectToPredefinedServices();
  }

  private async connectToPredefinedServices(): Promise<void> {
    const services: ServiceConfig[] = [
      {
        name: 'user-service',
        url: process.env.USER_SERVICE_URL ?? 'http://localhost:3003',
      },
      {
        name: 'shopping-service',
        url: process.env.SHOPPING_SERVICE_URL ?? 'http://localhost:3002',
      },
    ];

    for (const service of services) {
      try {
        await this.connectToService(service.name, service.url);
      } catch (error) {
        this.logger.error(`Failed to connect to ${service.name}:`, error);
      }
    }

    this.logger.log(`Federation Gateway connected to ${this.registeredServices.size} services`);
  }

  private async connectToService(serviceName: string, serviceUrl: string): Promise<void> {
    this.logger.log(`Connecting to ${serviceName} at ${serviceUrl}/mcp`);

    const client = new Client({
      name: 'mcp-federation-gateway',
      version: '3.0.0',
    });

    const transport = new StreamableHTTPClientTransport(new URL(`${serviceUrl}/mcp`));
    await client.connect(transport as Parameters<typeof client.connect>[0]);

    this.logger.log(`Successfully connected to ${serviceName}`);

    const toolsResponse = await client.listTools();
    const tools = toolsResponse.tools || [];

    this.logger.log(`Loaded ${tools.length} tools from ${serviceName}: ${tools.map((t) => t.name).join(', ')}`);

    const registeredService: RegisteredService = {
      name: serviceName,
      url: serviceUrl,
      client,
      tools,
    };

    this.registeredServices.set(serviceName, registeredService);
  }

  private createServerWithTools(): McpServer {
    const server = new McpServer(
      {
        name: 'mcp-federation-gateway',
        version: '3.0.0',
      },
      { capabilities: { logging: {} } },
    );

    // Add a simple test tool
    server.tool(
      'test-tool',
      'A simple test tool to verify server functionality',
      (): CallToolResult => ({
        content: [
          {
            type: 'text',
            text: `Test tool is working! Connected services: ${this.registeredServices.size}`,
          },
        ],
      }),
    );

    // Register all tools from connected services
    for (const service of this.registeredServices.values()) {
      this.registerServiceTools(server, service);
    }

    return server;
  }

  private registerServiceTools(server: McpServer, service: RegisteredService): void {
    for (const tool of service.tools) {
      const toolName = `${service.name}.${tool.name}`;

      this.logger.log(`Registering tool: ${toolName}`);
      this.logger.debug(`Tool definition:`, JSON.stringify(tool, null, 2));

      try {
        const inputSchema = this.convertToolInputSchema(tool.inputSchema);

        const toolConfig: {
          description: string;
          inputSchema?: Record<string, z.ZodTypeAny>;
        } = {
          description: tool.description ?? `Tool ${tool.name} from ${service.name}`,
        };

        if (inputSchema) {
          toolConfig.inputSchema = inputSchema;
        }

        server.registerTool(toolName, toolConfig, async (params: unknown): Promise<CallToolResult> => {
          return this.forwardToolCall(service, tool.name, params);
        });

        this.logger.log(`Successfully registered tool: ${toolName} with schema`);
      } catch (error) {
        this.logger.error(`Failed to register tool ${toolName}:`, error);
        this.registerToolWithFallback(server, service, tool, toolName);
      }
    }
  }

  private convertToolInputSchema(inputSchema: unknown): Record<string, z.ZodTypeAny> | undefined {
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

  private registerToolWithFallback(server: McpServer, service: RegisteredService, tool: Tool, toolName: string): void {
    try {
      server.tool(
        toolName,
        tool.description ?? `Tool ${tool.name} from ${service.name}`,
        async (params: unknown): Promise<CallToolResult> => {
          return this.forwardToolCall(service, tool.name, params);
        },
      );
      this.logger.log(`Successfully registered tool: ${toolName} (fallback without schema)`);
    } catch (fallbackError) {
      this.logger.error(`Failed to register tool ${toolName} even with fallback:`, fallbackError);
    }
  }

  private async forwardToolCall(
    service: RegisteredService,
    toolName: string,
    params: unknown,
  ): Promise<CallToolResult> {
    try {
      this.logger.log(`Forwarding tool call: ${toolName} to ${service.name}`);
      this.logger.debug(`Parameters:`, JSON.stringify(params, null, 2));

      const result = await service.client.callTool({
        name: toolName,
        arguments: (params as Record<string, unknown>) || {},
      });

      this.logger.debug(`Tool call result:`, JSON.stringify(result, null, 2));

      if (this.isValidCallToolResult(result)) {
        return result;
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error calling tool ${toolName} on ${service.name}:`, errorMessage);

      return {
        content: [
          {
            type: 'text',
            text: `Error calling tool ${toolName} on ${service.name}: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }

  private isValidCallToolResult(result: unknown): result is CallToolResult {
    return (
      result !== null &&
      typeof result === 'object' &&
      'content' in result &&
      Array.isArray((result as CallToolResult).content)
    );
  }

  @Post('register')
  async registerService(@Body() request: ServiceRegistrationRequest) {
    try {
      this.logger.log(`Registering new service: ${request.name} at ${request.url}`);

      await this.connectToService(request.name, request.url);

      const service = this.registeredServices.get(request.name);
      if (!service) {
        throw new Error('Failed to register service');
      }

      return {
        success: true,
        message: `Service ${request.name} registered successfully`,
        serviceName: request.name,
        serviceUrl: request.url,
        toolCount: service.tools.length,
        registeredTools: service.tools.map((t) => `${request.name}.${t.name}`),
      };
    } catch (error) {
      this.logger.error(`Failed to register service ${request.name}:`, error);
      throw new HttpException(`Service ${request.name} is not reachable at ${request.url}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Post()
  async handleMcpRequest(@Req() req: Request, @Res() res: Response) {
    try {
      this.logger.log('Handling MCP request...');

      const server = this.createServerWithTools();

      this.logger.log(`Created server with ${this.registeredServices.size} connected services`);

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

  async onModuleDestroy() {
    this.logger.log('Shutting down MCP Federation Gateway...');

    for (const service of this.registeredServices.values()) {
      try {
        if (service.client && typeof service.client.close === 'function') {
          await service.client.close();
          this.logger.log(`Closed connection to ${service.name}`);
        }
      } catch (error) {
        this.logger.error(`Error closing connection to ${service.name}:`, error);
      }
    }
  }
}
