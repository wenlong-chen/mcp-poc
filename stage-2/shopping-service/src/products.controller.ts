import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor() {}

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get product by ID',
    operationId: 'getProductById' 
  })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Product found' })
  findOne(@Param('id') id: string) {
    const numericId = +id;
    return {
      id: numericId,
      name: `Product #${numericId}`,
      price: 100 + numericId,
    };
  }
}
