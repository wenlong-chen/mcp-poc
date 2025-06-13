import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users.controller';
import { McpController } from './mcp.controller';

@Module({
  imports: [],
  controllers: [AppController, UsersController, McpController],
  providers: [AppService],
})
export class AppModule {}
