import { Controller, Post, Req, Res } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import z from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { Request, Response } from 'express';

@Controller('mcp')
export class McpController {
  private createServer(): McpServer {
    const server = new McpServer(
      {
        name: 'shopping-service',
        version: '3.0.0',
      },
      { capabilities: { logging: {} } },
    );

    // Native getProductById MCP tool
    server.tool(
      'getProductById',
      'Get product information by ID',
      {
        id: z.string().describe('The product ID to retrieve'),
      },
      async (params): Promise<CallToolResult> => {
        try {
          const numericId = +params.id;

          // Simulate product data (same logic as REST endpoint)
          const product = {
            id: numericId,
            name: `Product #${numericId}`,
            price: 100 + numericId,
          };

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(product, null, 2),
              },
            ],
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [
              {
                type: 'text',
                text: `Error retrieving product: ${errorMessage}`,
              },
            ],
            isError: true,
          };
        }
      },
    );

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
