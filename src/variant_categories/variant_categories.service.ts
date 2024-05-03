import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VariantCategoryEntity } from './entities/variant-category.entity';
import { Repository } from 'typeorm';
import { CreateVariantCategoryDto } from './dto/create-variant-category.dto';
import { VariantItemEntity } from 'src/variant_items/entities/variant-item.entity';
import { UserEntity } from 'src/users/entities/user.entity';

@Injectable()
export class VariantCategoriesService {
  constructor(
    @InjectRepository(VariantCategoryEntity)
    private readonly variantCategoryRepository: Repository<VariantCategoryEntity>,
    @InjectRepository(VariantItemEntity)
    private readonly variantItemEntity: Repository<VariantItemEntity>,
  ) {}

  async create(
    createVariantCategoryDto: CreateVariantCategoryDto,
    currentUser: UserEntity,
  ) {
    let variantCategory = {
      variantName: createVariantCategoryDto.title,
    };

    const newVariantCategory = await this.variantCategoryRepository.create(
      variantCategory,
    );

    newVariantCategory.addedBy = currentUser;

    const createdVariantCategory = await this.variantCategoryRepository.save(
      newVariantCategory,
    );

    for (let value of createVariantCategoryDto.values) {
      let variantItem = {
        name: value,
      };

      const newVariantItem = this.variantItemEntity.create(variantItem);

      newVariantItem.variantCategory = createdVariantCategory;

      await this.variantItemEntity.save(newVariantItem);
    }

    return createdVariantCategory;
  }

  async getSingleVariantCategory(id: number) {
    const variantCategory = await this.variantCategoryRepository.findOne({
      where: { id },
      relations: {
        variantItems: {
          variants: true,
        },
        addedBy: true,
      },
    });

    if (!variantCategory) {
      throw new NotFoundException('Variant category not found.');
    }

    return variantCategory;
  }
}
