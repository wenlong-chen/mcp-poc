import { Controller, Post, Req, Res, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { RegistryService } from '../registry/registry.service';
import { RegisteredTool } from '../registry/registry.types';

@Controller('mcp')
export class McpController {
  private readonly logger = new Logger(McpController.name);

  constructor(private readonly registryService: RegistryService) {}

  @Post()
  async handleMcpRequest(@Req() req: Request, @Res() res: Response) {
    try {
      this.logger.log('Handling MCP request...');
      const server = await this.createServerWithTools();

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
            message:
              error instanceof Error ? error.message : 'Internal server error',
          },
          id: null,
        });
      }
    }
  }

  private async createServerWithTools() {
    const tools = await this.registryService.getAllTools();

    const server = new McpServer(
      {
        name: 'mcp-federation-gateway',
        version: '3.1.0',
      },
      { capabilities: { logging: {} } },
    );

    for (const tool of tools) {
      server.registerTool(
        tool.name,
        tool.config,
        async (params: unknown): Promise<CallToolResult> => {
          return this.forwardToolCall(tool, params);
        },
      );
    }

    return server;
  }

  private async forwardToolCall(
    tool: RegisteredTool,
    params: unknown,
  ): Promise<CallToolResult> {
    try {
      const client = new Client({
        name: 'mcp-gateway-client',
        version: '3.1.0',
      });

      const transport = new StreamableHTTPClientTransport(
        new URL(`${tool.serviceUrl}/mcp`),
      );
      await client.connect(transport as Parameters<typeof client.connect>[0]);

      try {
        const result = await client.callTool({
          name: tool.originalToolName,
          arguments: (params as Record<string, unknown>) || {},
        });

        this.logger.log(`Tool call ${tool.name} completed successfully`);
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
      } finally {
        await client.close();
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error calling tool ${tool.originalToolName}: ${errorMessage}`,
      );

      return {
        content: [
          {
            type: 'text',
            text: `Error calling tool ${tool.originalToolName}: ${errorMessage}`,
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
}
