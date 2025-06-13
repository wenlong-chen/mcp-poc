import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsController } from './products.controller';
import { McpController } from './mcp.controller';

@Module({
  imports: [],
  controllers: [AppController, ProductsController, McpController],
  providers: [AppService],
})
export class AppModule {}
