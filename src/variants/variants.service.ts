import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VariantEntity } from './entities/variant.entity';
import { Repository } from 'typeorm';
import { CreateVariantDto } from './dto/create-variants.dto';
import { VariantItemEntity } from 'src/variant_items/entities/variant-item.entity';

@Injectable()
export class VariantsService {
  constructor(
    @InjectRepository(VariantEntity)
    private readonly variantRepository: Repository<VariantEntity>,
    @InjectRepository(VariantItemEntity)
    private readonly variantItemRepository: Repository<VariantItemEntity>,
  ) {}

  async create(createVariantDto: CreateVariantDto) {
    const variant = this.variantRepository.create(createVariantDto);

    //tạo variant items
    const itemIds = createVariantDto.variantItemIds;
    let items = [];

    for (let itemId of itemIds) {
      const variantItem = await this.variantItemRepository.findOne({
        where: {
          id: itemId,
        },
      });
      if (variantItem) {
        items.push(variantItem);
      }
    }

    if (items.length !== itemIds.length) {
      throw new BadRequestException(
        'variant items do not exist. pls create variant category before create product',
      );
    }

    variant.variantItems = items;

    return await this.variantRepository.save(variant);
  }

  async findOne(id: number) {
    const variant = await this.variantRepository.findOne({
      where: {
        id,
      },
      relations: {
        variantItems: true,
        product: true,
      },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found.');
    }

    return variant;
  }

  async delete(id: number) {
    const variant = await this.variantRepository.findOne({
      where: {
        id,
      },
      relations: {
        product: true,
      },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found.');
    }

    return await this.variantRepository.remove(variant);
  }
}
