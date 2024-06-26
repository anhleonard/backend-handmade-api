import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { Not, Repository } from 'typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { UserEntity } from 'src/users/entities/user.entity';
import dataSource from 'db/data-source';
import { OrdersService } from 'src/orders/orders.service';
import { VariantEntity } from 'src/variants/entities/variant.entity';
import { VariantItemEntity } from 'src/variant_items/entities/variant-item.entity';
import { VariantsService } from 'src/variants/variants.service';
import { StoreEntity } from 'src/stores/entities/stores.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductStatus } from './enum/product.enum';
import { UpdateApproveProductDto } from './dto/update-approve-product.dto';
import { UpdateFavouriteProducts } from './dto/update-favourite-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
    @InjectRepository(VariantEntity)
    private readonly variantRepository: Repository<VariantEntity>,
    @InjectRepository(VariantItemEntity)
    private readonly variantItemRepository: Repository<VariantItemEntity>,
    private readonly categoryService: CategoriesService,
    @Inject(forwardRef(() => OrdersService))
    private readonly orderService: OrdersService,
    private readonly variantService: VariantsService,
  ) {}

  async create(createProductDto: CreateProductDto, currentUser: UserEntity) {
    try {
      // check nếu categories truyền lên rỗng
      if (!createProductDto.categoryId.length) {
        throw new BadRequestException('Category ids is not empty.');
      }

      const categories = [];

      for (const categoryId of createProductDto.categoryId) {
        const category = await this.categoryService.findOne(categoryId);
        if (category) {
          categories.push(category);
        }
      }

      //find store of product
      let store = await this.storeRepository.findOne({
        where: {
          owner: {
            id: currentUser.id,
          },
        },
      });

      if (!store) {
        throw new NotFoundException('Not found store of this seller');
      }

      // tạo product
      let product = this.productRepository.create(createProductDto);

      product.category = categories;

      product.addedBy = currentUser;

      product.store = store;

      //variants
      if (createProductDto?.sampleVariants) {
        // return createProductDto.sampleVariants;
        let sampleVariants = createProductDto.sampleVariants;

        //Tìm min price
        const minUnitPrice = Math.min(
          ...sampleVariants.map((variant: any) => variant.unitPrice),
        );

        // Tính tổng inventoryNumber
        const totalInventoryNumber = sampleVariants.reduce(
          (total: number, variant: any) => total + variant?.inventoryNumber,
          0,
        );

        product.price = minUnitPrice;
        product.inventoryNumber = totalInventoryNumber;
        product.images = sampleVariants[0].image;

        product.variants = sampleVariants;
      }

      return await this.productRepository.save(product);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  //sau khi cập nhật variant xong thì update các thông tin của product như price, totalNumber
  async updateProductVariants(productId: number) {
    const product = await this.productRepository.findOne({
      where: {
        id: productId,
      },
      relations: {
        variants: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    let sampleVariants = product.variants;

    //Tìm min price
    const minUnitPrice = Math.min(
      ...sampleVariants.map((variant: any) => variant.unitPrice),
    );

    // Tính tổng inventoryNumber
    const totalInventoryNumber = sampleVariants.reduce(
      (total: number, variant: any) => total + variant?.inventoryNumber,
      0,
    );

    product.price = minUnitPrice;
    product.inventoryNumber = totalInventoryNumber;

    return await this.productRepository.save(product);
  }

  async findAll(
    query: any,
  ): Promise<{ products: any[]; totalProducts: any; limit: any }> {
    let filteredTotalProducts: number;
    let limit: number;

    if (!query.limit) {
      limit = 6;
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

  async filterSellingProducts(query: any) {
    const builder = this.productRepository.createQueryBuilder('products');

    builder.where('products.status = :status', { status: 'SELLING' });

    if (query?.productName) {
      const name = query.productName.toLowerCase();

      builder.andWhere(
        '(LOWER(products.productName) LIKE :productName OR LOWER(products.description) LIKE :productName)',
        {
          productName: `%${name}%`,
        },
      );
    }

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

    // filter by discount
    if (query?.discount) {
      if (parseInt(query?.discount) == 1) {
        builder.andWhere('products.discount > 0');
      }
    }

    const page: number = parseInt(query?.page as any) || 1;
    let perPage = 25;
    if (query?.limit) {
      perPage = query?.limit;
    }
    const total = await builder.getCount();

    builder.offset((page - 1) * perPage).limit(perPage);

    return {
      data: await builder.getMany(),
      total,
      page,
      last_page: Math.ceil(total / perPage),
    };
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id: id },
      relations: {
        addedBy: true,
        category: true,
        variants: {
          variantItems: {
            variantCategory: true,
          },
        },
        collections: true,
        store: {
          followers: true,
        },
        reviews: {
          user: true,
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

  // ----------------- start: FIND PRODUCTS BY SELLER --------------------- //
  async filterAllProductsBySeller(query: any, currentUser: UserEntity) {
    try {
      const builder = this.productRepository.createQueryBuilder('products');

      if (currentUser?.id) {
        const sellerId = currentUser?.id;
        builder.innerJoin(
          'products.addedBy',
          'addedBy',
          'addedBy.id = :sellerId',
          { sellerId },
        );
      }

      if (query?.productName) {
        const name = query.productName.toLowerCase();

        builder.andWhere(
          '(LOWER(products.productName) LIKE :productName OR LOWER(products.description) LIKE :productName)',
          {
            productName: `%${name}%`,
          },
        );
      }

      if (query?.status) {
        builder.andWhere('(products.status = :status)', {
          status: query?.status,
        });
      }

      if (query?.productCode) {
        builder.andWhere('(products.productCode = :productCode)', {
          productCode: query?.productCode,
        });
      }

      if (query?.inventoryNumber) {
        builder.andWhere('(products.inventoryNumber = :inventoryNumber)', {
          inventoryNumber: query?.inventoryNumber,
        });
      }

      const page: number = parseInt(query?.page as any) || 1;
      let perPage = 25;
      if (query?.limit) {
        perPage = query?.limit;
      }
      const total = await builder.getCount();

      builder.offset((page - 1) * perPage).limit(perPage);

      const products = await builder.getMany();

      let customProducts: ProductEntity[] = [];
      for (let product of products) {
        const foundProduct = await this.productRepository.findOne({
          where: {
            id: product.id,
          },
          relations: {
            category: true,
            variants: {
              variantItems: true,
            },
          },
        });

        customProducts.push(foundProduct);
      }

      return {
        data: customProducts,
        total,
        page,
        last_page: Math.ceil(total / perPage),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // -----------------end: FIND PRODUCTS BY SELLER --------------------- //

  async update(
    productId: number,
    updateProductDto: Partial<UpdateProductDto>,
    currentUser: UserEntity,
  ): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found to update!');
    }

    Object.assign(product, updateProductDto);
    product.addedBy = currentUser;

    if (
      updateProductDto.categoryId &&
      updateProductDto.categoryId.length !== 0
    ) {
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
    const product = await this.productRepository.findOne({
      where: {
        id,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found!');
    }

    if (
      product?.status !== ProductStatus.PENDING &&
      product?.status !== ProductStatus.VIOLATE &&
      product?.status !== ProductStatus.OFF
    ) {
      throw new BadRequestException(
        'Status is not pending, violate or off. Not permission to remove!',
      );
    }

    const order = await this.orderService.findOneByProductId(product.id);
    if (order) throw new BadRequestException(`Products is in use.`);

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
    updateFavouriteProducts: UpdateFavouriteProducts,
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
          id: updateFavouriteProducts.productId,
        },
      });

      if (!product) {
        throw new NotFoundException('Product not exist.');
      }

      if (updateFavouriteProducts?.isAdd === true) {
        items.push(product);
      } else {
        const productIndex = items.findIndex((item) => item.id === product.id);

        if (productIndex > -1) {
          items.splice(productIndex, 1);
        }
      }

      user.favouriteProducts = items;

      return await this.userRepository.save(user);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getFavouriteProducts(currentUser: UserEntity) {
    try {
      let user = await this.userRepository.findOne({
        where: {
          id: currentUser?.id,
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

  async getProductImages(id: number) {
    const product = await this.productRepository.findOne({
      where: {
        id,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return product;
  }

  //duyệt sp bởi admin
  async updateApprove(id: number, data: UpdateApproveProductDto) {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.status !== ProductStatus.PENDING) {
      throw new BadRequestException('Product status is not pending to update!');
    }

    if (
      !data.isAccepted &&
      (data.rejectReason === undefined || data.editHint === undefined)
    ) {
      throw new BadRequestException('Reject reason & Edit hint are required!');
    }

    if (data.isAccepted) {
      product.status = ProductStatus.SELLING;
    } else {
      product.status = ProductStatus.VIOLATE;
    }

    product.updatedAt = new Date(); // update time duyệt

    Object.assign(product, data);

    return await this.productRepository.save(product);
  }

  // ADMIN
  async filterAdminProducts(query: any) {
    //query: limit, productName, productCode, status
    const builder = this.productRepository.createQueryBuilder('products');

    if (query?.status) {
      builder.andWhere('(products.status = :status)', {
        status: query?.status,
      });
    }

    if (query?.productCode) {
      builder.andWhere('(products.productCode = :productCode)', {
        productCode: query?.productCode,
      });
    }

    if (query?.productName) {
      const name = query.productName.toLowerCase();

      builder.andWhere(
        '(LOWER(products.productName) LIKE :productName OR LOWER(products.description) LIKE :productName)',
        {
          productName: `%${name}%`,
        },
      );
    }

    const page: number = parseInt(query?.page as any) || 1;
    let perPage = 25;
    if (query?.limit) {
      perPage = query?.limit;
    }
    const total = await builder.getCount();

    builder.offset((page - 1) * perPage).limit(perPage);

    // CUSTOM PRODUCTS
    const products = await builder.getMany();

    const customProducts: ProductEntity[] = [];

    for (let product of products) {
      const foundProduct = await this.productRepository.findOne({
        where: {
          id: product.id,
        },
        relations: {
          store: true,
          category: true,
          variants: {
            variantItems: true,
          },
        },
      });

      customProducts.push(foundProduct);
    }

    return {
      data: customProducts,
      total,
      page,
      last_page: Math.ceil(total / perPage),
    };
  }

  async getStoreProducts(storeId: number, query: any) {
    const builder = this.productRepository.createQueryBuilder('products');

    builder.where('products.status = :status', { status: 'SELLING' });

    builder
      .leftJoinAndSelect('products.store', 'store')
      .andWhere('store.id = :id', { id: storeId });

    if (query?.productName) {
      const name = query.productName.toLowerCase();

      builder.andWhere(
        '(LOWER(products.productName) LIKE :productName OR LOWER(products.description) LIKE :productName)',
        {
          productName: `%${name}%`,
        },
      );
    }

    //lọc theo sắp xếp
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

    // filter by discount
    if (query?.discount) {
      if (parseInt(query?.discount) == 1) {
        builder.andWhere('products.discount > 0');
      }
    }

    const page: number = parseInt(query?.page as any) || 1;
    let perPage = 25;
    if (query?.limit) {
      perPage = query?.limit;
    }
    const total = await builder.getCount();

    builder.offset((page - 1) * perPage).limit(perPage);

    const products = await builder.getMany();

    return {
      data: products,
      total,
      page,
      last_page: Math.ceil(total / perPage),
    };
  }

  async filterProductsByStore(storeId: number, query: any) {
    const builder = this.productRepository.createQueryBuilder('products');

    builder.where('products.status = :status', { status: 'SELLING' });

    builder
      .leftJoinAndSelect('products.store', 'store')
      .andWhere('store.id = :id', { id: storeId });

    if (query?.productName) {
      const name = query.productName.toLowerCase();

      builder.andWhere(
        '(LOWER(products.productName) LIKE :productName OR LOWER(products.description) LIKE :productName)',
        {
          productName: `%${name}%`,
        },
      );
    }

    const products = await builder.getMany();

    return products;
  }

  async reportProduct(productId: number, updatedData: UpdateProductDto) {
    const product = await this.productRepository.findOne({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    Object.assign(product, updatedData);

    return await this.productRepository.save(product);
  }
}
