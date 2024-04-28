import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { VariantItemEntity } from './entities/variant-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVariantItemsDto } from './dto/create-variant-items.dto';

@Injectable()
export class VariantItemsService {
  constructor(
    @InjectRepository(VariantItemEntity)
    private readonly variantItemsRepository: Repository<VariantItemEntity>,
  ) {}

  async create(
    variantItemsDto: CreateVariantItemsDto,
  ): Promise<VariantItemEntity> {
    try {
      let variantItems = this.variantItemsRepository.create(variantItemsDto);
      variantItems = await this.variantItemsRepository.save(variantItems);
      return variantItems;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number) {
    const variantItem = await this.variantItemsRepository.findOne({
      where: { id: id },
      relations: {
        variants: true,
      },
    });
    if (!variantItem) throw new NotFoundException('Variant item not found.');
    return variantItem;
  }
}
