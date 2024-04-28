import { Controller, Get, Param } from '@nestjs/common';
import { VariantsService } from './variants.service';

@Controller('variants')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.variantsService.findOne(+id);
  }
}
