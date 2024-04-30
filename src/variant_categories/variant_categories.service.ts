import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VariantCategoryEntity } from './entities/variant-category.entity';
import { Repository } from 'typeorm';
import { CreateVariantCategoryDto } from './dto/create-variant-category.dto';

@Injectable()
export class VariantCategoriesService {
  constructor(
    @InjectRepository(VariantCategoryEntity)
    private readonly variantCategoryRepository: Repository<VariantCategoryEntity>,
  ) {}

  async create(createVariantCategoryDto: CreateVariantCategoryDto) {
    return createVariantCategoryDto;
  }
}
