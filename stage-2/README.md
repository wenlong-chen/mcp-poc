# Stage 2: OpenAPI-based Tool Auto-loading

Stage 2 includes a shopping service, user service, and an MCP gateway that dynamically loads tools from OpenAPI specifications.

## Services

- **shopping-service**: NestJS service with `GET /products/:id` API and OpenAPI documentation
- **user-service**: NestJS service with `GET /users/:id` API and OpenAPI documentation  
- **mcp-gateway**: NestJS MCP Server that automatically discovers and loads tools from service OpenAPI specs

## How to Run

```bash
cd stage-2
docker compose up
```

Services will start:
- `mcp-gateway` on port 3001
- `shopping-service` on internal port 3000
- `user-service` on internal port 3000

## How to Test

1. Start MCP Inspector:
```bash
npx @modelcontextprotocol/inspector
```

2. Configure connection:
   - **Server URL**: `http://localhost:3001/mcp`

3. The gateway will automatically discover and create tools for:
   - shopping-service: Get product by ID
   - user-service: Get user by ID

4. Test the tools with appropriate IDs like "123"

## Features

- **Automatic Tool Discovery**: MCP gateway scans OpenAPI specs from services
- **Dynamic Tool Creation**: Tools are automatically generated from API endpoints
- **Multiple Services**: Supports multiple backend services with different APIs
- **OpenAPI Integration**: Uses Swagger/OpenAPI for service documentation and discovery
