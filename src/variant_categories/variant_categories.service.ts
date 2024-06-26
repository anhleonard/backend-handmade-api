import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VariantCategoryEntity } from './entities/variant-category.entity';
import { Repository } from 'typeorm';
import { CreateVariantCategoryDto } from './dto/create-variant-category.dto';
import { VariantItemEntity } from 'src/variant_items/entities/variant-item.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { UpdateVariantCategoryDto } from './dto/update-variant-category.dto';

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
    const existVariantCate = await this.variantCategoryRepository.findOne({
      where: {
        variantName: createVariantCategoryDto.title,
        addedBy: {
          id: currentUser.id,
        },
      },
    });

    if (existVariantCate) {
      throw new BadRequestException('Tên phân loại đã tồn tại!');
    }

    if (createVariantCategoryDto.title === '') {
      throw new BadRequestException('Vui lòng nhập tên phân loại.');
    }

    if (createVariantCategoryDto.values?.length === 0) {
      throw new BadRequestException('Cần ít nhất 1 tag');
    }

    let variantCategory = {
      variantName: createVariantCategoryDto.title,
    };

    const newVariantCategory =
      this.variantCategoryRepository.create(variantCategory);

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

  async update(id: number, updateVariantCategoryDto: UpdateVariantCategoryDto) {
    const existVariantCate = await this.variantCategoryRepository.findOne({
      where: { id },
    });

    if (!existVariantCate) {
      throw new NotFoundException('Phân loại không tồn tại!');
    }

    if (!updateVariantCategoryDto?.values?.length) {
      throw new BadRequestException('Cần ít nhất 1 tag');
    }

    // Lấy tất cả các item hiện có cho category này
    const existingItems = await this.variantItemEntity.find({
      where: {
        variantCategory: {
          id: existVariantCate.id,
        },
      },
      relations: {
        variantCategory: true,
      },
    });

    const existingItemNames = new Set(existingItems.map((item) => item.name));

    // Kiểm tra xem các giá trị mới có trùng lặp không
    const newValues = updateVariantCategoryDto.values;
    for (let value of newValues) {
      if (existingItemNames.has(value)) {
        throw new BadRequestException(`Tùy chọn '${value}' đã tồn tại!`);
      }
    }

    // Tạo các item mới
    const newItems = newValues.map((value) => {
      let variantItem = this.variantItemEntity.create({ name: value });
      variantItem.variantCategory = existVariantCate;
      return variantItem;
    });

    await this.variantItemEntity.save(newItems);

    return existVariantCate;
  }

  async getListVariantCategories(currentUser: UserEntity) {
    const variantCategories = await this.variantCategoryRepository.find({
      where: {
        addedBy: {
          id: currentUser.id,
        },
      },
      relations: {
        variantItems: true,
      },
    });

    if (!variantCategories) {
      throw new NotFoundException('Variant category not found.');
    }

    return variantCategories;
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

  async deleteVariantCategory(id: number) {
    const variantCategory = await this.variantCategoryRepository.findOne({
      where: {
        id,
      },
    });

    if (!variantCategory) {
      throw new NotFoundException('Variant category not found.');
    }

    return await this.variantCategoryRepository.remove(variantCategory);
  }
}
