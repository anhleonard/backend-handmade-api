import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { VariantsService } from './variants.service';
import { CreateVariantDto } from './dto/create-variants.dto';

@Controller('variants')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Post('/create')
  async create(@Body() createVariantDto: CreateVariantDto) {
    return await this.variantsService.create(createVariantDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.variantsService.findOne(+id);
  }

  @Delete('/delete/:id')
  async delete(@Param('id') id: string) {
    return await this.variantsService.delete(+id);
  }
}
