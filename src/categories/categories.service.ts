import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/users/entities/user.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    currentUser: UserEntity,
  ): Promise<CategoryEntity> {
    const category = this.categoryRepository.create(createCategoryDto);
    category.addedBy = currentUser;
    return await this.categoryRepository.save(category);
  }

  async findAll() {
    const categories = await this.categoryRepository.find({
      select: {
        id: true,
        title: true,
        description: true,
        products: true,
        image: true,
      },
      relations: {
        products: {
          store: true,
        },
      },
    });

    return categories;
  }

  async findAllCategories() {
    const categories = await this.categoryRepository.find({
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
      },
    });

    return categories;
  }

  async findOne(id: number): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOne({
      where: { id: id },
      relations: { addedBy: true, products: true },
      select: {
        addedBy: {
          id: true,
          name: true,
          email: true,
        },
      },
    });
    if (!category) throw new NotFoundException('Category not found.');
    return category;
  }

  async findOneAndFilterProducts(id: number, query: any) {
    const builder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.products', 'products')
      .where('category.id = :id', { id: id });

    //filter selling products
    builder.andWhere('products.status = :status', { status: 'SELLING' });

    // filter by discount
    if (query?.discount) {
      if (parseInt(query?.discount) == 1) {
        builder.andWhere('products.discount > 0');
      }
    }

    //filter sort
    const sort: any = query?.sort;

    if (sort === 'BEST_RATING') {
      builder.orderBy('CAST(products.averageRating AS FLOAT)', 'DESC');
    } else if (sort === 'PRICE_LOW_HIGH') {
      builder.orderBy('CAST(products.price AS INT)', 'ASC');
    } else if (sort === 'PRICE_HIGH_LOW') {
      builder.orderBy('CAST(products.price AS INT)', 'DESC');
    } else if (sort === 'NEWEST') {
      builder.orderBy('products.createdAt', 'DESC');
    } else if (sort === 'MOST_POPULAR') {
      builder.orderBy('products.soldNumber', 'DESC');
    }

    // Lọc theo khoảng giá khi price là chuỗi
    if (query?.minPrice && query?.maxPrice) {
      builder.andWhere(
        'CAST(products.price AS FLOAT) BETWEEN :minPrice AND :maxPrice',
        {
          minPrice: query.minPrice,
          maxPrice: query.maxPrice,
        },
      );
    } else if (query?.minPrice) {
      builder.andWhere('CAST(products.price AS FLOAT) >= :minPrice', {
        minPrice: query.minPrice,
      });
    } else if (query?.maxPrice) {
      builder.andWhere('CAST(products.price AS FLOAT) <= :maxPrice', {
        maxPrice: query.maxPrice,
      });
    }

    const category = await builder.getOne();

    return category;
  }

  async update(
    categoryId: number,
    fields: Partial<UpdateCategoryDto>,
  ): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOne({
      where: {
        id: categoryId,
      },
    });
    if (!category) throw new NotFoundException('Category not found.');
    Object.assign(category, fields);
    return await this.categoryRepository.save(category);
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
