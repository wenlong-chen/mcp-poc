import { Controller, Post, Req, Res } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import z from 'zod';
import axios from 'axios';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { Request, Response } from 'express';

const getServer = () => {
  const server = new McpServer(
    {
      name: 'simple-mcp-server',
      version: '1.0.0',
    },
    { capabilities: { logging: {} } },
  );

  server.tool('foo', 'Foo', { bar: z.string().describe('bar') }, ({ bar }): CallToolResult => {
    return {
      content: [{ type: 'text', text: JSON.stringify({ bar }) }],
    };
  });

  server.tool(
    'get-product-info',
    'Gets product info by id',
    {
      id: z.number().describe('product id'),
    },
    async ({ id }): Promise<CallToolResult> => {
      const shoppingServiceUrl = process.env.SHOPPING_SERVICE_URL || 'http://localhost:3000';
      const resp = await axios.get(`${shoppingServiceUrl}/products/${id}`);

      if (resp.status !== 200) {
        return {
          content: [
            {
              type: 'text',
              text: `Failed to get product info for id ${id}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(resp.data),
          },
        ],
      };
    },
  );
  return server;
};

@Controller('mcp')
export class McpController {
  @Post()
  async handleMcpRequest(@Req() req: Request, @Res() res: Response) {
    try {
      const server = getServer();
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
