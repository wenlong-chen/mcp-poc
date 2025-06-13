import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { McpController } from './mcp.controller';

@Module({
  imports: [],
  controllers: [AppController, McpController],
  providers: [AppService],
})
export class AppModule {}
