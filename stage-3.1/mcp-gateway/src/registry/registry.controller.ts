import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RegistryService } from './registry.service';
import { RegisterServiceDto } from './dto/register-service.dto';
import { ApiKeyGuard } from '../auth/api-key.guard';

@Controller()
export class RegistryController {
  constructor(private readonly registryService: RegistryService) {}

  @Post('register')
  @UseGuards(ApiKeyGuard)
  async register(@Body() dto: RegisterServiceDto) {
    const service = await this.registryService.register(dto);
    return {
      success: true,
      message: `Service '${service.name}' registered successfully`,
      service: {
        id: service.id,
        name: service.name,
        url: service.url,
        createdAt: service.createdAt,
      },
    };
  }

  @Put('update/:name')
  @UseGuards(ApiKeyGuard)
  async update(@Param('name') name: string) {
    const service = await this.registryService.update(name);
    return {
      success: true,
      message: `Service '${service.name}' updated successfully`,
      service: {
        id: service.id,
        name: service.name,
        url: service.url,
        updatedAt: service.updatedAt,
      },
    };
  }

  @Delete('delete/:name')
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('name') name: string) {
    await this.registryService.delete(name);
  }
}
