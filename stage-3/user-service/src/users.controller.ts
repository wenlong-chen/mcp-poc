import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor() {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    operationId: 'getUserById',
  })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'User found' })
  findOne(@Param('id') id: string) {
    const numericId = +id;
    return {
      id: numericId,
      name: `User ${numericId}`,
      email: `user${numericId}@example.com`,
      createdAt: new Date().toISOString(),
    };
  }
}
