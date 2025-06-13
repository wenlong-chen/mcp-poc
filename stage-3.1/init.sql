-- Stage 3.1 Database Schema
-- Simple schema with services and service_tools tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(512) NOT NULL,
    
    -- Common fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Unique constraint for service name (excluding soft deleted)
CREATE UNIQUE INDEX IF NOT EXISTS idx_services_name_unique 
ON services(name) WHERE deleted_at IS NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_services_updated_at ON services(updated_at);

-- Service tools table
CREATE TABLE IF NOT EXISTS service_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    tools JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Common fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Unique constraint for service_id (one tools record per service)
CREATE UNIQUE INDEX IF NOT EXISTS idx_service_tools_service_id_unique 
ON service_tools(service_id) WHERE deleted_at IS NULL;

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_service_tools_service_id ON service_tools(service_id);
CREATE INDEX IF NOT EXISTS idx_service_tools_updated_at ON service_tools(updated_at);

-- JSONB indexes for tools queries
CREATE INDEX IF NOT EXISTS idx_service_tools_tools_gin ON service_tools USING GIN (tools);

-- Log table creation
\echo 'Database schema created successfully!'; 