# Stage 3.1: Production-Ready MCP Federation Gateway

本阶段实现了一个生产级的 MCP Federation Gateway，具有数据库持久化和 Redis 缓存功能。

## 架构特性

### 核心改进
- ✅ **数据库持久化**: 使用 PostgreSQL 存储服务注册信息和工具元数据
- ✅ **Redis 版本控制**: 通过 Redis 时间戳实现注册表变更检测
- ✅ **简化表结构**: 只有 `services` 和 `service_tools` 两个核心表
- ✅ **API Key 认证**: 管理端点使用 API Key 保护
- ✅ **软删除**: 支持服务的软删除操作

### 数据库设计
```sql
-- 服务注册表
services: id, name, url, created_at, updated_at, deleted_at

-- 服务工具表（JSONB 存储）
service_tools: id, service_id, tools (jsonb[]), created_at, updated_at, deleted_at
```

### Redis 版本控制
- Key: `mcp:registry:version`
- Value: 时间戳，每次注册/更新/删除时更新

## API 端点

### 管理端点 (需要 API Key)

#### 1. 注册服务
```bash
POST /register
Content-Type: application/json
X-API-Key: your-api-key

{
  "name": "user-service",
  "url": "http://user-service:3000"
}
```

#### 2. 更新服务
```bash
PUT /update/user-service
X-API-Key: your-api-key
```

#### 3. 删除服务
```bash
DELETE /delete/user-service
X-API-Key: your-api-key
```

### MCP 端点 (无需认证)

#### 4. MCP 协议通信
```bash
POST /mcp
Content-Type: application/json

{...MCP请求...}
```

## 环境变量

```bash
# Node Environment
NODE_ENV=development

# Database Configuration  
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=mcp_registry

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Authentication
API_KEY=mcp-api-key-123

# Application
PORT=3000
```

## 运行方式

### 使用 Docker Compose（推荐）

```bash
# 构建并启动所有服务
docker-compose up --build

# 后台运行
docker-compose up -d --build

# 查看日志
docker-compose logs -f mcp-gateway

# 停止服务
docker-compose down
```

### 本地开发

```bash
# 安装依赖
cd mcp-gateway
npm install

# 确保 PostgreSQL 和 Redis 运行
# 设置环境变量

# 运行开发模式
npm run start:dev
```

## 使用示例

### 1. 注册测试服务

```bash
# 注册 user-service
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mcp-api-key-123" \
  -d '{
    "name": "user-service",
    "url": "http://localhost:3003"
  }'

# 注册 shopping-service
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mcp-api-key-123" \
  -d '{
    "name": "shopping-service", 
    "url": "http://localhost:3002"
  }'
```

### 2. 测试 MCP 连接

```bash
# 使用 MCP CLI 测试
npx @modelcontextprotocol/cli mcp://localhost:3001/mcp list-tools
```

### 3. 管理服务

```bash
# 更新服务（重新拉取工具）
curl -X PUT http://localhost:3001/update/user-service \
  -H "X-API-Key: mcp-api-key-123"

# 删除服务
curl -X DELETE http://localhost:3001/delete/user-service \
  -H "X-API-Key: mcp-api-key-123"
```

## 健康检查

```bash
# 应用健康检查
curl http://localhost:3001/health
```

## 特性说明

### 1. 简单表结构
- **services**: 存储服务基本信息 (name, url)
- **service_tools**: 存储工具元数据 (JSONB 数组)

### 2. Redis 版本控制
- 每次变更都会更新 Redis 中的时间戳
- Gateway 可以检查版本变更来决定是否重新加载

### 3. 朴素实现策略
- 当前版本每次 MCP 请求都从数据库读取（简单可靠）
- 为未来优化预留了架构空间

### 4. 认证设计
- 管理操作需要 API Key
- MCP 通信无需认证（符合协议设计）

## 技术栈

- **Framework**: NestJS
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **ORM**: TypeORM
- **Redis Client**: ioredis
- **MCP SDK**: @modelcontextprotocol/sdk
- **Container**: Docker & Docker Compose

## 下一步优化方向

1. **连接池管理**: 优化数据库和 Redis 连接
2. **缓存策略**: 智能缓存工具元数据
3. **监控指标**: 添加 Prometheus 指标
4. **配置管理**: 更精细的配置选项
5. **错误处理**: 更健壮的错误恢复机制 