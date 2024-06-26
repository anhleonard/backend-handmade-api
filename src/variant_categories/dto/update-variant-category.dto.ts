import { PartialType } from '@nestjs/mapped-types';
import { CreateVariantCategoryDto } from './create-variant-category.dto';

export class UpdateVariantCategoryDto extends PartialType(
  CreateVariantCategoryDto,
) {}
