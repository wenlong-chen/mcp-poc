import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { ZodRawShape } from 'zod';
import { Service } from './service.entity';
import { ServiceTools, Tool } from './service-tools.entity';
import { RegisterServiceDto } from './dto/register-service.dto';
import { jsonSchemaToZod, JsonSchema } from '../utils/zod.utils';
import { RegisteredTool } from './registry.types';
import Redis from 'ioredis';

@Injectable()
export class RegistryService implements OnModuleInit {
  private readonly logger = new Logger(RegistryService.name);
  private readonly redis: Redis;
  private allTools: RegisteredTool[] = [];
  private currentVersion: number = 0;

  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceTools)
    private readonly serviceToolsRepository: Repository<ServiceTools>,
  ) {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async onModuleInit() {
    await this.loadAllTools();
  }

  async register(dto: RegisterServiceDto): Promise<Service> {
    // Check if service name already exists
    const existingByName = await this.serviceRepository.findOne({
      where: { name: dto.name },
    });
    if (existingByName) {
      throw new ConflictException(
        `Service with name '${dto.name}' already exists`,
      );
    }

    // Check if service URL already exists
    const existingByUrl = await this.serviceRepository.findOne({
      where: { url: dto.url },
    });
    if (existingByUrl) {
      throw new ConflictException(
        `Service with URL '${dto.url}' already exists`,
      );
    }

    // Create service
    const service = this.serviceRepository.create(dto);
    const savedService = await this.serviceRepository.save(service);

    // Fetch tools from the service
    try {
      const tools = await this.fetchToolsFromService(dto.url);

      // Save tools
      const serviceTools = this.serviceToolsRepository.create({
        serviceId: savedService.id,
        tools,
      });
      await this.serviceToolsRepository.save(serviceTools);

      this.logger.log(
        `Registered service '${dto.name}' with ${tools.length} tools`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to fetch tools from service '${dto.name}':`,
        error,
      );
      // Save service with empty tools array
      const serviceTools = this.serviceToolsRepository.create({
        serviceId: savedService.id,
        tools: [],
      });
      await this.serviceToolsRepository.save(serviceTools);
    }

    // Update Redis version
    await this.updateRedisVersion();

    return savedService;
  }

  async update(name: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { name },
    });
    if (!service) {
      throw new NotFoundException(`Service with name '${name}' not found`);
    }

    // Fetch new tools from the service
    try {
      const tools = await this.fetchToolsFromService(service.url);

      // Update or create tools
      let serviceTools = await this.serviceToolsRepository.findOne({
        where: { serviceId: service.id },
      });

      if (serviceTools) {
        serviceTools.tools = tools;
        await this.serviceToolsRepository.save(serviceTools);
      } else {
        serviceTools = this.serviceToolsRepository.create({
          serviceId: service.id,
          tools,
        });
        await this.serviceToolsRepository.save(serviceTools);
      }

      this.logger.log(`Updated service '${name}' with ${tools.length} tools`);
    } catch (error) {
      this.logger.error(`Failed to update tools for service '${name}':`, error);
      throw error;
    }

    // Update service timestamp (TypeORM will auto-update updated_at)
    await this.serviceRepository.save(service);

    // Update Redis version
    await this.updateRedisVersion();

    return service;
  }

  async delete(name: string): Promise<void> {
    const service = await this.serviceRepository.findOne({
      where: { name },
    });
    if (!service) {
      throw new NotFoundException(`Service with name '${name}' not found`);
    }

    // Soft delete (TypeORM will set deletedAt)
    await this.serviceRepository.softDelete(service.id);

    // Also soft delete tools
    await this.serviceToolsRepository.softDelete({ serviceId: service.id });

    // Update Redis version
    await this.updateRedisVersion();

    this.logger.log(`Deleted service '${name}'`);
  }

  async getAllTools(): Promise<RegisteredTool[]> {
    // Get current version
    const versionString = await this.redis.get('mcp:registry:version');
    const latestVersion = versionString ? parseInt(versionString, 10) : 0;

    // If version updated, reload
    if (latestVersion > this.currentVersion) {
      await this.loadAllTools();
    }

    return this.allTools;
  }

  private async loadAllTools(): Promise<void> {
    this.logger.log('Loading all tools...');
    const versionString = await this.redis.get('mcp:registry:version');

    const services = await this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.tools', 'tools')
      .where('service.deletedAt IS NULL')
      .getMany();

    const allTools: RegisteredTool[] = [];

    for (const service of services) {
      const tools = service.tools?.tools || [];
      for (const tool of tools) {
        // Convert JSON Schema to Zod schema
        let convertedInputSchema: ZodRawShape | undefined;
        if (tool.inputSchema && typeof tool.inputSchema === 'object') {
          try {
            const schema = tool.inputSchema as JsonSchema;
            if (schema.type === 'object') {
              convertedInputSchema = jsonSchemaToZod(schema);
            } else {
              this.logger.warn(
                `Tool ${tool.name} has non-object inputSchema, skipping conversion`,
              );
            }
          } catch (error) {
            this.logger.warn(
              `Failed to convert inputSchema for tool ${tool.name}:`,
              error,
            );
          }
        }

        allTools.push({
          name: `${service.name}.${tool.name}`,
          config: {
            description: tool.description,
            inputSchema: convertedInputSchema,
            // outputSchema and annotations can be added later when available
          },
          serviceUrl: service.url,
          originalToolName: tool.name,
        });
      }
    }

    this.allTools = allTools;

    // Update current version
    this.currentVersion = versionString ? parseInt(versionString, 10) : 0;

    this.logger.log(
      `Loaded ${allTools.length} tools, version: ${this.currentVersion}`,
    );
  }

  private async fetchToolsFromService(url: string): Promise<Tool[]> {
    const client = new Client({
      name: 'mcp-registry-client',
      version: '3.1.0',
    });

    const transport = new StreamableHTTPClientTransport(new URL(`${url}/mcp`));
    await client.connect(transport as Parameters<typeof client.connect>[0]);

    try {
      const response = await client.listTools();
      const tools = response.tools || [];

      // Convert MCP tools to our Tool interface
      return tools.map((tool) => ({
        name: tool.name,
        description: tool.description || '',
        inputSchema: tool.inputSchema,
      }));
    } finally {
      await client.close();
    }
  }

  private async updateRedisVersion(): Promise<void> {
    const version = Date.now();
    await this.redis.set('mcp:registry:version', version.toString());
  }
}
