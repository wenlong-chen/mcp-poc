import { Controller, Get, Param } from '@nestjs/common';

@Controller('products')
export class ProductsController {
  constructor() {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    const numericId = +id;
    return {
      id: numericId,
      name: `Product #${numericId}`,
      price: 100 + numericId,
    };
  }
}
