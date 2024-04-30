import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VariantEntity } from './entities/variant.entity';
import { Repository } from 'typeorm';
import { CreateVariantDto } from './dto/create-variants.dto';

@Injectable()
export class VariantsService {
  constructor(
    @InjectRepository(VariantEntity)
    private readonly variantRepository: Repository<VariantEntity>,
  ) {}

  async create(variantDto: CreateVariantDto) {
    // try {
    //   let variant = this.variantRepository.create(variantDto);
    //   variant = await this.variantRepository.save(variant);
    //   return variant;
    // } catch (error) {
    //   throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    // }
  }

  async findOne(id: number) {
    const variant = await this.variantRepository.findOne({
      where: { id: id },
      relations: {
        product: true,
        options: true,
      },
      select: {
        product: {
          id: true,
        },
      },
    });
    if (!variant) throw new NotFoundException('Variant item not found.');
    return variant;
  }
}
