# Stage 3: MCP Service Mesh / Federation

In Stage 3, we implement a complete MCP Service Mesh / Federation architecture where:

- `shopping-service` and `user-service` run as native MCP servers (using streamable HTTP transport)
- `mcp-gateway` acts as a Federation Gateway, using MCP SDK Client to connect to other services
- All MCP communication uses streamable HTTP transport
- All services support Bearer Token authentication
- Health checks manage startup sequence

## Architecture Overview

```
┌─────────────────┐    MCP Client     ┌─────────────────┐    MCP Server     ┌─────────────────┐
│  MCP Gateway    │◄──(HTTP/JSON)────►│ Shopping Service │◄──(HTTP/JSON)────►│  Native MCP     │
│ (Federation)    │                   │  (MCP Server)   │                   │    Tools        │
│                 │                   │                 │                   │                 │
│ - Registration  │    MCP Client     │ - getProductById│                   │ - getProductById│
│ - Tool Routing  │◄──(HTTP/JSON)────►│ - Health Check  │                   │                 │
│ - Auth          │                   │                 │                   │                 │
│ - Dynamic Tools │                   └─────────────────┘                   └─────────────────┘
└─────────────────┘    MCP Client     ┌─────────────────┐    MCP Server     ┌─────────────────┐
        │          ◄──(HTTP/JSON)────►│  User Service   │◄──(HTTP/JSON)────►│  Native MCP     │
        │                             │  (MCP Server)   │                   │    Tools        │
        │                             │                 │                   │                 │
        │                             │ - getUserById   │                   │ - getUserById   │
        └─────────────────────────────│ - Health Check  │                   │                 │
                              Docker Network            │                   │                 │
                                      └─────────────────┘                   └─────────────────┘
```

## Core Features

### MCP Federation Gateway
- **Dynamic Service Discovery**: Connects to pre-configured services using MCP SDK Client at startup
- **Tool Discovery**: Dynamically retrieves available tools from each service using `client.listTools()`
- **Smart Routing**: Routes calls to the correct service based on tool names
- **Fault Tolerance**: Uses fallback tool definitions when services are unavailable

### Streamable HTTP Transport
- **Standardized Communication**: All MCP communication uses streamable HTTP transport
- **Container Friendly**: Suitable for HTTP communication between Docker containers
- **Scalable**: Supports multi-node deployment and load balancing

### Service Details

#### Shopping Service (Port 3002)
- **MCP Endpoint**: `POST /mcp` (streamable HTTP)
- **Health Check**: `GET /health`
- **Tools**: `getProductById` - Get product information by ID

#### User Service (Port 3003)
- **MCP Endpoint**: `POST /mcp` (streamable HTTP)
- **Health Check**: `GET /health`
- **Tools**: `getUserById` - Get user information by ID

#### MCP Gateway (Port 3001)
- **MCP Endpoint**: `POST /mcp` (Federation entry point, streamable HTTP)
- **Service Registration**: `POST /register`
- **Service List**: `POST /services`
- **Health Check**: `GET /health`

## How to Run

### 1. Build and Start All Services

```bash
cd stage-3
docker-compose up --build
```

Health checks ensure services start in the correct order:
1. `shopping-service` and `user-service` start first
2. Wait for health checks to pass
3. `mcp-gateway` starts last and connects to other services

### 2. Verify Service Status

Check that all services are running properly:

```bash
# Check shopping-service
curl http://localhost:3002/health

# Check user-service  
curl http://localhost:3003/health

# Check mcp-gateway
curl http://localhost:3001/health
```

## How to Test

### 1. Test Bearer Token Authentication

Requests without token should be rejected:

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Should return 401 Unauthorized.

### 2. Test MCP Tool Discovery

Test tool listing with correct Bearer Token:

```bash
# List available tools (dynamically retrieved by gateway from each service)
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mcp-token-123" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

### 3. Test Federation Tool Calls

Call tools routed by the federation gateway:

```bash
# Call getProductById tool (routed to shopping-service)
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mcp-token-123" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "getProductById",
      "arguments": {"id": "123"}
    }
  }'

# Call getUserById tool (routed to user-service)
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mcp-token-123" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "getUserById",
      "arguments": {"id": "456"}
    }
  }'
```

### 4. Test Service Registration

Register new MCP service:

```bash
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mcp-token-123" \
  -d '{
    "name": "custom-service",
    "url": "http://custom-service:3000"
  }'
```

View registered services:

```bash
curl -X POST http://localhost:3001/services \
  -H "Authorization: Bearer mcp-token-123"
```

## MCP Federation Workflow

1. **Startup Connection**: Gateway connects to each service using `StreamableHTTPClientTransport`
2. **Tool Discovery**: Dynamically retrieves each service's tool list via `client.listTools()`
3. **Tool Registration**: Registers all discovered tools in the Gateway's MCP Server
4. **Request Routing**: Routes calls to the correct backend service based on tool names
5. **Result Forwarding**: Forwards backend service responses to the client

## Authentication Configuration

The default Bearer Token is `mcp-token-123`, which can be customized via the `MCP_BEARER_TOKEN` environment variable.

## Troubleshooting

1. **Service Startup Failure**: Check Docker container logs
   ```bash
   docker-compose logs shopping-service
   docker-compose logs user-service
   docker-compose logs mcp-gateway
   ```

2. **Health Check Failure**: Ensure all services properly expose `/health` endpoints

3. **Authentication Failure**: Ensure correct Bearer Token is used

4. **MCP Connection Failure**: Check streamable HTTP transport connection
   - Ensure services are running on correct ports
   - Verify MCP endpoint responses
   - Check network connectivity

5. **Tool Call Failure**: Check MCP request format and tool parameters

## Extension and Deployment

### Adding New MCP Services

1. Create new service implementing MCP protocol (using streamable HTTP transport)
2. Add health check endpoint
3. Register service using `/register` endpoint, Gateway will automatically discover tools
4. Call tools through Federation Gateway

### Production Deployment

This architecture supports:
- **Microservice Scaling**: Each service can be scaled independently
- **Load Balancing**: Deploy load balancer in front of Gateway
- **Service Discovery**: Integrate with Kubernetes service discovery
- **Monitoring**: Add logging and metrics collection
- **Security**: Implement stronger authentication and authorization

This streamable HTTP transport-based MCP Federation architecture provides a standardized foundation for building large-scale, scalable MCP service meshes.
