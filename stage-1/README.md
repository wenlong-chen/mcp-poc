# Stage 1: Hardcoded Implementation

Stage 1 includes a shopping service and an MCP gateway with hardcoded tools.

## Services

- **shopping-service**: NestJS service with `GET /products/:id` API
- **mcp-gateway**: NestJS MCP Server with hardcoded `getProductById` tool

## How to Run

```bash
cd stage-1
docker compose up
```

Services will start:
- `mcp-gateway` on port 3001
- `shopping-service` on internal port 3000

## How to Test

1. Start MCP Inspector:
```bash
npx @modelcontextprotocol/inspector
```

2. Configure connection:
   - **Server URL**: `http://localhost:3001/mcp`

3. Test the `getProductById` tool with product ID like "123"
