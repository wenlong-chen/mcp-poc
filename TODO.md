# MCP POC Project TODO List

This document outlines the tasks for building the MCP POC project, divided into three independent stages.

## Stage 1: Hardcoded Implementation ✅ COMPLETED

- [x] Create `stage-1/` directory.
- [x] Initialize `shopping-service` as a NestJS project inside `stage-1/`.
    - [x] Add a `GET /products/:id` REST endpoint.
    - [x] Create a `Dockerfile` for the service.
- [x] Initialize `mcp-gateway` as a NestJS project inside `stage-1/`.
    - [x] Implement MCP Server using `@modelcontextprotocol/sdk`.
    - [x] Add Bearer Token authentication (hardcoded token).
    - [x] Hardcode a `getProductById(id)` tool that calls `shopping-service`.
    - [x] Create a `Dockerfile` for the service.
- [x] Create `docker-compose.yml` in `stage-1/` to run both services.
- [x] Provide instructions on how to run and test Stage 1.

## Stage 2: OpenAPI-based Tool Auto-loading ✅ COMPLETED

- [x] Create `stage-2/` directory.
- [x] Initialize `shopping-service` in `stage-2/`.
    - [x] Add `@nestjs/swagger` to expose an OpenAPI spec for `GET /products/:id`.
    - [x] Create a `Dockerfile`.
- [x] Initialize `user-service` in `stage-2/`.
    - [x] Add `@nestjs/swagger` to expose an OpenAPI spec for `GET /users/:id`.
    - [x] Create a `Dockerfile`.
- [x] Initialize `mcp-gateway` in `stage-2/`.
    - [x] Implement MCP Server with dynamic OpenAPI tool loading.
    - [x] On startup, fetch OpenAPI specs from `shopping-service` and `user-service`.
    - [x] Dynamically parse OpenAPI specs to create and register MCP tools with parameters.
    - [x] Create a `Dockerfile`.
- [x] Create `docker-compose.yml` in `stage-2/` to run all three services.
- [x] Provide instructions on how to run and test Stage 2.

## Stage 3: MCP Service Mesh / Federation

- [ ] Create `stage-3/` directory.
- [ ] Refactor `shopping-service` in `stage-3/`.
    - [ ] Integrate `@modelcontextprotocol/sdk` to run as an MCP Server within the NestJS app.
    - [ ] Natively provide a `getProductById` MCP tool.
    - [ ] Create a `Dockerfile`.
- [ ] Refactor `user-service` in `stage-3/`.
    - [ ] Integrate `@modelcontextprotocol/sdk` to run as an MCP Server within the NestJS app.
    - [ ] Natively provide a `getUserById` MCP tool.
    - [ ] Create a `Dockerfile`.
- [ ] Upgrade `mcp-gateway` in `stage-3/` to a Federation Gateway.
    - [ ] Implement a `POST /register` endpoint for service registration.
    - [ ] Implement routing logic to forward tool calls to the correct internal MCP server.
    - [ ] Implement Bearer Token authentication.
    - [ ] Create a `Dockerfile`.
- [ ] Create `docker-compose.yml` in `stage-3/` with health checks to manage startup order.
- [ ] Provide instructions on how to run and test Stage 3. 