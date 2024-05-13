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
import { UserEntity } from 'src/users/entities/user.entity';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class VariantsService {
  constructor(
    @InjectRepository(VariantEntity)
    private readonly variantRepository: Repository<VariantEntity>,
    @InjectRepository(VariantItemEntity)
    private readonly variantItemRepository: Repository<VariantItemEntity>,
  ) {}

  async create(createVariantDto: CreateVariantDto, currentUser: UserEntity) {
    const variant = this.variantRepository.create(createVariantDto);

    //tạo variant items
    const itemIds = createVariantDto.variantItemIds;
    let items = [];

    for (let itemId of itemIds) {
      const variantItem = await this.variantItemRepository.findOne({
        where: {
          id: parseInt(itemId),
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
    variant.addedBy = currentUser;

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

  async update(
    id: number,
    updateVariantDto: UpdateVariantDto,
    currentUser: UserEntity,
  ) {
    const variant = await this.variantRepository.findOne({
      where: {
        id,
        addedBy: {
          id: currentUser.id,
        },
      },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    Object.assign(variant, updateVariantDto);

    return await this.variantRepository.save(variant);
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
      throw new NotFoundException('Variant not found');
    }

    if (variant && variant?.product != null) {
      throw new BadRequestException(
        'Not permission to delete because of existing product!',
      );
    }

    return await this.variantRepository.remove(variant);
  }
}
