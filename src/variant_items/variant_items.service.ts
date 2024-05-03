import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { VariantItemEntity } from './entities/variant-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class VariantItemsService {
  constructor(
    @InjectRepository(VariantItemEntity)
    private readonly variantItemsRepository: Repository<VariantItemEntity>,
  ) {}

  async findOne(id: number) {
    const variantItem = await this.variantItemsRepository.findOne({
      where: { id: id },
      relations: {
        variants: true,
        variantCategory: true,
      },
    });
    if (!variantItem) throw new NotFoundException('Variant item not found.');
    return variantItem;
  }
}
