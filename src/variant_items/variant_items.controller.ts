import { Controller, Get, Param } from '@nestjs/common';
import { VariantItemsService } from './variant_items.service';

@Controller('variant-items')
export class VariantItemsController {
  constructor(private readonly variantItemsService: VariantItemsService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.variantItemsService.findOne(+id);
  }
}
