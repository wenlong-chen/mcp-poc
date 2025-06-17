# Stage 3.1: Production-Ready MCP Federation Gateway

This stage implements a production-grade MCP Federation Gateway with database persistence and Redis caching functionality.

## Architecture Features

### Core Improvements
- ✅ **Database Persistence**: Uses PostgreSQL to store service registration information and tool metadata
- ✅ **Redis Version Control**: Implements registry change detection through Redis timestamps
- ✅ **Simplified Table Structure**: Only has two core tables: `services` and `service_tools`
- ✅ **API Key Authentication**: Management endpoints are protected with API Key
- ✅ **Soft Delete**: Supports soft delete operations for services

### Database Design
```sql
-- Service registry table
services: id, name, url, created_at, updated_at, deleted_at

-- Service tools table (JSONB storage)
service_tools: id, service_id, tools (jsonb[]), created_at, updated_at, deleted_at
```

### Redis Version Control
- Key: `mcp:registry:version`
- Value: Timestamp, updated every time on register/update/delete

## API Endpoints

### Management Endpoints (Require API Key)

#### 1. Register Service
```bash
POST /register
Content-Type: application/json
X-API-Key: your-api-key

{
  "name": "user-service",
  "url": "http://user-service:3000"
}
```

#### 2. Update Service
```bash
PUT /update/user-service
X-API-Key: your-api-key
```

#### 3. Delete Service
```bash
DELETE /delete/user-service
X-API-Key: your-api-key
```

### MCP Endpoints (No Authentication Required)

#### 4. MCP Protocol Communication
```bash
POST /mcp
Content-Type: application/json

{...MCP request...}
```

## Environment Variables

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

## How to Run

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f mcp-gateway

# Stop services
docker-compose down
```

### Local Development

```bash
# Install dependencies
cd mcp-gateway
npm install

# Ensure PostgreSQL and Redis are running
# Set environment variables

# Run development mode
npm run start:dev
```

## Usage Examples

### 1. Register Test Services

```bash
# Register user-service
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mcp-api-key-123" \
  -d '{
    "name": "user-service",
    "url": "http://localhost:3003"
  }'

# Register shopping-service
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mcp-api-key-123" \
  -d '{
    "name": "shopping-service", 
    "url": "http://localhost:3002"
  }'
```

### 2. Test MCP Connection

```bash
# Test using MCP CLI
npx @modelcontextprotocol/cli mcp://localhost:3001/mcp list-tools
```

### 3. Manage Services

```bash
# Update service (re-fetch tools)
curl -X PUT http://localhost:3001/update/user-service \
  -H "X-API-Key: mcp-api-key-123"

# Delete service
curl -X DELETE http://localhost:3001/delete/user-service \
  -H "X-API-Key: mcp-api-key-123"
```

## Health Check

```bash
# Application health check
curl http://localhost:3001/health
```

## Feature Description

### 1. Simple Table Structure
- **services**: Stores basic service information (name, url)
- **service_tools**: Stores tool metadata (JSONB array)

### 2. Redis Version Control
- Updates Redis timestamp on every change
- Gateway can check version changes to decide whether to reload

### 3. Naive Implementation Strategy
- Current version reads from database on every MCP request (simple and reliable)
- Reserves architectural space for future optimizations

### 4. Authentication Design
- Management operations require API Key
- MCP communication requires no authentication (conforming to protocol design)

## Technology Stack

- **Framework**: NestJS
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **ORM**: TypeORM
- **Redis Client**: ioredis
- **MCP SDK**: @modelcontextprotocol/sdk
- **Container**: Docker & Docker Compose

## Next Optimization Directions

1. **Connection Pool Management**: Optimize database and Redis connections
2. **Caching Strategy**: Intelligent caching of tool metadata
3. **Monitoring Metrics**: Add Prometheus metrics
4. **Configuration Management**: More granular configuration options
5. **Error Handling**: More robust error recovery mechanisms 