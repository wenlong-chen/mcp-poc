import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Service } from './registry/service.entity';
import { ServiceTools } from './registry/service-tools.entity';
import { RegistryService } from './registry/registry.service';
import { RegistryController } from './registry/registry.controller';
import { McpController } from './mcp/mcp.controller';

@Module({
  imports: [
    // Database configuration
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'postgres.stage-31.orb.local',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'mcp_registry',
      entities: [Service, ServiceTools],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),
    // Entity repositories
    TypeOrmModule.forFeature([Service, ServiceTools]),
  ],
  controllers: [AppController, RegistryController, McpController],
  providers: [AppService, RegistryService],
})
export class AppModule {}
