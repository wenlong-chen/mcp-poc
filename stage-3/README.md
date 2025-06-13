# Stage 3: MCP Service Mesh / Federation

在Stage 3中，我们实现了一个完整的MCP Service Mesh / Federation架构，其中：

- `shopping-service` 和 `user-service` 作为原生MCP服务器运行（使用streamable HTTP transport）
- `mcp-gateway` 作为Federation Gateway，使用MCP SDK Client连接到其他服务
- 所有MCP通信都使用streamable HTTP transport
- 所有服务都支持Bearer Token认证
- 使用健康检查管理启动顺序

## 架构概述

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

## 核心特性

### MCP Federation Gateway
- **动态服务发现**: 启动时通过MCP SDK Client连接到预配置的服务
- **工具拉取**: 使用`client.listTools()`从各服务动态获取可用工具
- **智能路由**: 根据工具名称将调用路由到正确的服务
- **容错机制**: 当服务不可用时使用fallback工具定义

### Streamable HTTP Transport
- **标准化通信**: 所有MCP通信都使用streamable HTTP transport
- **容器友好**: 适合Docker容器之间的HTTP通信
- **可扩展**: 支持多节点部署和负载均衡

### 服务详情

#### Shopping Service (端口 3002)
- **MCP端点**: `POST /mcp` (streamable HTTP)
- **健康检查**: `GET /health`
- **工具**: `getProductById` - 根据ID获取产品信息

#### User Service (端口 3003)
- **MCP端点**: `POST /mcp` (streamable HTTP)
- **健康检查**: `GET /health`
- **工具**: `getUserById` - 根据ID获取用户信息

#### MCP Gateway (端口 3001)
- **MCP端点**: `POST /mcp` (Federation入口，streamable HTTP)
- **服务注册**: `POST /register`
- **服务列表**: `POST /services`
- **健康检查**: `GET /health`

## 如何运行

### 1. 构建和启动所有服务

```bash
cd stage-3
docker-compose up --build
```

健康检查会确保服务按正确顺序启动：
1. `shopping-service` 和 `user-service` 先启动
2. 等待健康检查通过
3. `mcp-gateway` 最后启动并连接到其他服务

### 2. 验证服务状态

检查所有服务是否正常运行：

```bash
# 检查shopping-service
curl http://localhost:3002/health

# 检查user-service  
curl http://localhost:3003/health

# 检查mcp-gateway
curl http://localhost:3001/health
```

## 如何测试

### 1. 测试Bearer Token认证

不带token的请求应该被拒绝：

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

应该返回 401 Unauthorized。

### 2. 测试MCP工具发现

使用正确的Bearer Token测试工具列表：

```bash
# 列出可用工具（由gateway从各服务动态获取）
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mcp-token-123" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

### 3. 测试Federation工具调用

调用由federation gateway路由的工具：

```bash
# 调用getProductById工具（路由到shopping-service）
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

# 调用getUserById工具（路由到user-service）
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

### 4. 测试服务注册

注册新的MCP服务：

```bash
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mcp-token-123" \
  -d '{
    "name": "custom-service",
    "url": "http://custom-service:3000"
  }'
```

查看注册的服务：

```bash
curl -X POST http://localhost:3001/services \
  -H "Authorization: Bearer mcp-token-123"
```

## MCP Federation工作流程

1. **启动时连接**: Gateway使用`StreamableHTTPClientTransport`连接到各服务
2. **工具发现**: 通过`client.listTools()`动态获取每个服务的工具列表
3. **工具注册**: 将所有发现的工具注册到Gateway的MCP Server中
4. **请求路由**: 根据工具名称将调用路由到正确的后端服务
5. **结果转发**: 将后端服务的响应转发给客户端

## 认证配置

默认的Bearer Token是 `mcp-token-123`，可以通过环境变量 `MCP_BEARER_TOKEN` 自定义。

## 故障排除

1. **服务启动失败**: 检查Docker容器日志
   ```bash
   docker-compose logs shopping-service
   docker-compose logs user-service
   docker-compose logs mcp-gateway
   ```

2. **健康检查失败**: 确保所有服务都正确暴露了 `/health` 端点

3. **认证失败**: 确保使用正确的Bearer Token

4. **MCP连接失败**: 检查streamable HTTP transport连接
   - 确保服务在正确端口运行
   - 验证MCP端点响应
   - 检查网络连接

5. **工具调用失败**: 检查MCP请求格式和工具参数

## 扩展和部署

### 添加新的MCP服务

1. 创建实现MCP协议的新服务（使用streamable HTTP transport）
2. 添加健康检查端点
3. 使用 `/register` 端点注册服务，Gateway会自动发现工具
4. 通过Federation Gateway调用工具

### 生产部署

这种架构支持：
- **微服务扩展**: 每个服务可以独立扩展
- **负载均衡**: 在Gateway前部署负载均衡器
- **服务发现**: 集成Kubernetes服务发现
- **监控**: 添加日志和指标收集
- **安全**: 实现更强的认证和授权机制

这种基于streamable HTTP transport的MCP Federation架构为构建大规模、可扩展的MCP服务网格提供了标准化的基础。
