import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { VariantCategoriesService } from './variant_categories.service';
import { Roles } from 'src/utility/common/user-roles.enum';
import { AuthenticationGuard } from 'src/utility/guards/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guards/authorization.guard';
import { CreateVariantCategoryDto } from './dto/create-variant-category.dto';

@Controller('variant-categories')
export class VariantCategoriesController {
  constructor(
    private readonly variantCategoriesService: VariantCategoriesService,
  ) {}

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Post('/create')
  async create(@Body() createVariantCategoryDto: CreateVariantCategoryDto) {
    return await this.variantCategoriesService.create(createVariantCategoryDto);
  }
}
