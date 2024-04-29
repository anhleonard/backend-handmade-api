import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { UserEntity } from 'src/users/entities/user.entity';
import dataSource from 'db/data-source';
import { OrdersService } from 'src/orders/orders.service';
import { VariantEntity } from 'src/variants/entities/variant.entity';
import { VariantItemEntity } from 'src/variant_items/entities/variant-item.entity';
import { VariantsService } from 'src/variants/variants.service';
import { VariantItemsService } from 'src/variant_items/variant_items.service';
import { CategoryEntity } from 'src/categories/entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(VariantEntity)
    private readonly variantRepository: Repository<VariantEntity>,
    @InjectRepository(VariantItemEntity)
    private readonly variantItemRepository: Repository<VariantItemEntity>,
    private readonly categoryService: CategoriesService,
    @Inject(forwardRef(() => OrdersService))
    private readonly orderService: OrdersService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    currentUser: UserEntity,
  ): Promise<ProductEntity> {
    try {
      const categories = [];

      for (const categoryId of createProductDto.categoryId) {
        const category = await this.categoryService.findOne(categoryId);
        if (category) {
          categories.push(category);
        }
      }

      // tạo product
      let product = this.productRepository.create(createProductDto);

      product.category = categories;

      product.addedBy = currentUser;

      const savedProduct = await this.productRepository.save(product);

      //variants
      let sampleVariants = createProductDto.sampleVariants;

      for (const variant of sampleVariants) {
        //tạo và save variants
        let createdVariant = this.variantRepository.create({
          variantName: variant.variantName,
          product: savedProduct,
        });

        createdVariant = await this.variantRepository.save(createdVariant);

        for (const variantItems of variant.options) {
          //tạo và save item variants
          let optionItem = this.variantItemRepository.create(variantItems);
          optionItem.variants = createdVariant;
          optionItem = await this.variantItemRepository.save(optionItem);
        }
      }

      return savedProduct;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(
    query: any,
  ): Promise<{ products: any[]; totalProducts: any; limit: any }> {
    let filteredTotalProducts: number;
    let limit: number;

    if (!query.limit) {
      limit = 4;
    } else {
      limit = query.limit;
    }

    const queryBuilder = dataSource
      .getRepository(ProductEntity)
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoin('product.reviews', 'review')
      .addSelect([
        'COUNT(review.id) AS reviewCount',
        'AVG(review.ratings)::numeric(10,2) AS avgRating',
      ])
      .groupBy('product.id,category.id');

    const sample = await queryBuilder.getRawMany();

    console.log(sample);

    const totalProducts = await queryBuilder.getCount();

    if (query.search) {
      const search = query.search;
      queryBuilder.andWhere('product.productName like :title', {
        title: `%${search}%`,
      });
    }

    if (query.category) {
      queryBuilder.andWhere('category.id=:id', { id: query.category });
    }

    if (query.minPrice) {
      queryBuilder.andWhere('product.price>=:minPrice', {
        minPrice: query.minPrice,
      });
    }
    if (query.maxPrice) {
      queryBuilder.andWhere('product.price<=:maxPrice', {
        maxPrice: query.maxPrice,
      });
    }

    if (query.minRating) {
      queryBuilder.andHaving('AVG(review.ratings)>=:minRating', {
        minRating: query.minRating,
      });
    }

    if (query.maxRating) {
      queryBuilder.andHaving('AVG(review.ratings) <=:maxRating', {
        maxRating: query.maxRating,
      });
    }

    queryBuilder.limit(limit);

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const products = await queryBuilder.getRawMany();

    return { products, totalProducts, limit };
  }

  // async getAllProducts(
  //   query: any,
  // ): Promise<{ products: any[]; totalProducts: any; limit: any }> {
  //   let filteredTotalProducts: number;
  //   let limit: number;

  //   if (!query.limit) {
  //     limit = 4;
  //   } else {
  //     limit = query.limit;
  //   }

  //   const queryBuilder = dataSource
  //     .getRepository(ProductEntity)
  //     .createQueryBuilder('product');

  //   const sample = await queryBuilder.getRawMany();

  //   const products = await this.productRepository.find({
  //     relations: {
  //       category: true,
  //       reviews: true,
  //       variants: {
  //         options: true,
  //       },
  //     },
  //   });

  //   if (query.search) {
  //     const search = query.search;
  //   }

  //   const totalProducts = products.length;

  //   return { products, totalProducts, limit };
  // }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id: id },
      relations: {
        addedBy: true,
        category: true,
        variants: {
          options: true,
        },
      },
      select: {
        addedBy: {
          id: true,
          name: true,
          email: true,
        },
        category: {
          id: true,
          title: true,
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found.');
    return product;
  }

  async update(
    id: number,
    updateProductDto: Partial<UpdateProductDto>,
    currentUser: UserEntity,
  ): Promise<ProductEntity> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    product.addedBy = currentUser;
    if (updateProductDto.categoryId) {
      const categories = [];

      for (const categoryId of updateProductDto.categoryId) {
        const category = await this.categoryService.findOne(categoryId);
        if (category) {
          categories.push(category);
        }
      }

      product.category = categories;
    }

    //dang o day
    product.updatedAt = new Date();

    return await this.productRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    console.log(product);
    const order = await this.orderService.findOneByProductId(product.id);
    if (order) throw new BadRequestException('Products is in use.');

    return await this.productRepository.remove(product);
  }

  async updateStock(id: number, stock: number, status: string) {
    let product = await this.findOne(id);
    // if (status === OrderStatus.DELIVERED) {
    //   product.stock -= stock;
    // } else {
    //   product.stock += stock;
    // }
    product.inventoryNumber = stock;
    product = await this.productRepository.save(product);
    return product;
  }

  // favourite products
  async updateFavouriteProducts(
    productId: number,
    currentUser: UserEntity,
  ): Promise<UserEntity> {
    try {
      let user = await this.userRepository.findOne({
        where: {
          id: currentUser.id,
        },
        relations: {
          favouriteProducts: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      let items = user.favouriteProducts ?? [];

      const product = await this.productRepository.findOne({
        where: {
          id: productId,
        },
      });

      if (!product) {
        throw new NotFoundException('Product not exist.');
      }

      items.push(product);

      user.favouriteProducts = items;

      return await this.userRepository.save(user);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getFavouriteProducts(userId: number) {
    try {
      let user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
        relations: {
          favouriteProducts: true,
        },
      });

      if (user) {
        return user.favouriteProducts;
      } else {
        throw new NotFoundException('User not found.');
      }
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
