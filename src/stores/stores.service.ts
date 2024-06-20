import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from 'src/users/entities/user.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { StoreEntity } from './entities/stores.entity';
import { MoreThan, Not, Repository } from 'typeorm';
import { UpdateStoreDto } from './dto/update-store.dto';
import { ProductStatus } from 'src/products/enum/product.enum';
import { OrderStatus } from 'src/orders/enums/order-status.enum';
import { ChangeFollowerDto } from './dto/change-follower.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { TypeScore } from 'src/constants/enums';
import { StoreStatus } from './enum/stores.enum';
import { EmbeddingsService } from 'src/embeddings/embeddings.service';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private embeddingsService: EmbeddingsService,
  ) {}

  async create(createStoreDto: CreateStoreDto): Promise<StoreEntity> {
    try {
      const seller = await this.userRepository.findOne({
        where: {
          id: createStoreDto.sellerId,
        },
        relations: {
          store: true,
        },
      });

      if (seller.store) {
        throw new BadRequestException('This seller already has store.');
      }

      const store = await this.storeRepository.findOne({
        where: {
          name: createStoreDto.name,
        },
      });

      if (store) {
        throw new BadRequestException('Store name already exist.');
      }

      let createdStore = this.storeRepository.create(createStoreDto);
      createdStore.owner = seller;

      seller.hasStore = true;
      seller.frontCard = createStoreDto.frontCard;
      seller.backCard = createStoreDto.backCard;

      await this.userRepository.save(seller); //save thông tin seller sau khi đã tạo store
      return await this.storeRepository.save(createdStore); //save thông tin store
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async update(
    updateStoreDto: UpdateStoreDto,
    currentUser: UserEntity,
  ): Promise<StoreEntity> {
    try {
      const seller = await this.userRepository.findOne({
        where: {
          id: currentUser.id,
        },
        relations: {
          store: true,
        },
      });

      if (!seller.store) {
        throw new BadRequestException('This seller has no store.');
      }

      //nếu có update tên shop
      if (updateStoreDto.name) {
        const store = await this.storeRepository.findOne({
          where: {
            name: updateStoreDto.name,
          },
        });

        if (store) {
          throw new BadRequestException('Store name already exist.');
        }
      }

      if (updateStoreDto?.frontCard) {
        seller.frontCard = updateStoreDto.frontCard;
      }

      if (updateStoreDto?.backCard) {
        seller.backCard = updateStoreDto.backCard;
      }

      const updatedSeller = await this.userRepository.save(seller); //save thông tin seller sau khi đã update store

      const updatedStore = updatedSeller.store;

      if (updateStoreDto?.notApproveReason !== undefined) {
        if (updateStoreDto?.notApproveReason === null) {
          updatedStore.notApproveReason === null;
        }
      }

      //update vector embedding nếu thay đổi description
      if (
        updateStoreDto?.description &&
        updatedStore.description !== updateStoreDto.description
      ) {
        const variables = {
          storeId: updatedStore.id,
          description: updateStoreDto.description.toString(),
        };

        await this.embeddingsService.update(variables);
      }

      Object.assign(updatedStore, updateStoreDto);

      updatedStore.owner = currentUser;

      return await this.storeRepository.save(updatedStore);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getAllStores(): Promise<StoreEntity[]> {
    return await this.storeRepository.find({
      relations: {
        products: true,
      },
    });
  }

  async findStore(storeId: number): Promise<StoreEntity> {
    const store = await this.storeRepository.findOne({
      where: {
        id: storeId,
      },
      relations: {
        products: true,
        owner: true,
        orders: true,
        collections: {
          products: true,
        },
        followers: true,
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  async adminFilterStores(query: any) {
    const builder = this.storeRepository.createQueryBuilder('stores');

    //filter theo status
    if (query?.status) {
      builder.andWhere('(stores.status = :status)', {
        status: query.status,
      });
    }

    if (query?.notApproveReason !== undefined) {
      const value =
        query.notApproveReason === 'null' ? null : query.notApproveReason;

      if (value === null) {
        builder.andWhere('(stores.notApproveReason IS NULL)');
      } else {
        builder.andWhere('(stores.notApproveReason = :notApproveReason)', {
          notApproveReason: value,
        });
      }
    }

    //filter theo auction name
    if (query?.storeName) {
      const name = query.storeName.toLowerCase();
      builder.andWhere(
        '(LOWER(stores.name) LIKE :storeName OR LOWER(stores.description) LIKE :storeName)',
        { storeName: `%${name}%` },
      );
    }

    const page: number = parseInt(query?.page as any) || 1;
    let perPage = 25;
    if (query?.limit) {
      perPage = query?.limit;
    }
    const total = await builder.getCount();

    builder.offset((page - 1) * perPage).limit(perPage);

    const stores = await builder.getMany();

    const customStores: StoreEntity[] = [];

    for (let store of stores) {
      const foundStore = await this.storeRepository.findOne({
        where: {
          id: store.id,
        },
        relations: {
          owner: true,
          orders: true,
          products: true,
        },
      });

      customStores.push(foundStore);
    }

    return {
      data: customStores,
      total,
      page,
      last_page: Math.ceil(total / perPage),
    };
  }

  async updateStore(storeId: number, updateStoreDto: UpdateStoreDto) {
    const store = await this.storeRepository.findOne({
      where: {
        id: storeId,
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    //tạo mới embedding desc cho store
    const variables = {
      storeId: storeId,
    };
    const embededData = await this.embeddingsService.create(variables);

    Object.assign(store, updateStoreDto);
    store.embedding = embededData;

    return await this.storeRepository.save(store);
  }

  async allStoreProducts(currentUser: UserEntity) {
    const store = await this.storeRepository.findOne({
      where: {
        owner: {
          id: currentUser.id,
        },
      },
      relations: {
        owner: true,
        products: true,
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const allProducts = store?.products;

    const filteredProducts = allProducts?.filter(
      (item) => item.status === ProductStatus.SELLING,
    );

    return filteredProducts;
  }

  formatDate(inputDate: string): string {
    const date = new Date(inputDate);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    };
    return date.toLocaleDateString('en-GB', options);
  }

  async getStoreSales(currentUser: UserEntity) {
    const store = await this.storeRepository.findOne({
      where: {
        status: StoreStatus.ACTIVE,
        owner: {
          id: currentUser.id,
        },
      },
      relations: ['orders'],
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Lấy ngày hiện tại
    const currentDate = new Date();

    // Tạo một mảng để lưu trữ dữ liệu
    const revenueByDay = [];

    // Duyệt qua 12 ngày gần nhất
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i); // Giảm ngày đi i ngày để lấy các ngày trước đó

      // Lấy ngày đặt hàng của đơn hàng
      const orderDate = date.toISOString().split('T')[0]; // Chỉ lấy phần ngày, không cần giờ

      // Lấy tất cả các đơn hàng của ngày orderDate
      const ordersOfTheDay = store.orders.filter(
        (order) =>
          new Date(order.orderAt.toString()).toISOString().split('T')[0] ===
          orderDate,
      );

      if (ordersOfTheDay.length > 0) {
        // Tính tổng doanh thu từ các đơn hàng của ngày
        const totalRevenue = ordersOfTheDay.reduce(
          (total, order) => total + order.provisionalAmount,
          0,
        );
        revenueByDay.push({
          orderDate: orderDate,
          orderAt: this.formatDate(orderDate),
          totalRevenue: totalRevenue,
          totalOrders: ordersOfTheDay.length,
        });
      } else {
        revenueByDay.push({
          orderDate: orderDate,
          orderAt: this.formatDate(orderDate),
          totalRevenue: 0,
          totalOrders: 0,
        });
      }
    }

    return revenueByDay.reverse(); // Trả về thông tin về 12 ngày gần nhất
  }

  async bestSaleProducts(currentUser: UserEntity) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const foundStore = await this.storeRepository.findOne({
      where: {
        owner: {
          id: currentUser.id,
        },
      },
      relations: {
        owner: true,
      },
    });

    if (!foundStore) {
      throw new NotFoundException('Store of this seller not found.');
    }

    const store = await this.storeRepository.findOne({
      where: {
        owner: {
          id: currentUser.id,
        },
        orders: {
          status: Not(OrderStatus.CENCELLED),
          orderAt: MoreThan(thirtyDaysAgo),
        },
      },
      relations: {
        owner: true,
        orders: {
          orderProducts: {
            product: true,
          },
        },
      },
    });

    if (!store) {
      return [];
    }

    if (store.orders.length) {
      const orderProducts = store.orders
        .map((order) => order.orderProducts)
        .flat();

      const productSalesMap = new Map<number, number>();

      orderProducts.forEach((orderProduct) => {
        const productId = orderProduct.product.id;
        const productQuantity = orderProduct.productQuantity;
        const totalQuantity = productSalesMap.get(productId) || 0;
        productSalesMap.set(productId, totalQuantity + productQuantity);
      });

      const topProducts = Array.from(productSalesMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([productId, totalQuantity]) => ({
          productId: orderProducts.find((op) => op.product.id === productId)
            .product.id,
          productName: orderProducts.find((op) => op.product.id === productId)
            .product.productName,
          totalQuantity,
        }));

      return topProducts;
    }
  }

  async singleStore(currentUser: UserEntity) {
    try {
      const store = await this.storeRepository.findOne({
        where: {
          owner: {
            id: currentUser.id,
          },
        },
        relations: {
          owner: true,
        },
      });

      if (!store) {
        throw new NotFoundException('Store not found');
      }

      return store;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async changeFollower(changeFollowerDto: ChangeFollowerDto) {
    const store = await this.storeRepository.findOne({
      where: {
        id: changeFollowerDto.storeId,
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const user = await this.userRepository.findOne({
      where: {
        id: changeFollowerDto.userId,
      },
      relations: {
        lovedStores: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let lovedStoresUser = user.lovedStores;

    // Check if the store already exists in lovedStoresUser
    const storeExists = lovedStoresUser?.some(
      (lovedStore) => lovedStore.id === store.id,
    );

    if (storeExists) {
      // Remove the store from lovedStoresUser
      lovedStoresUser = lovedStoresUser.filter(
        (lovedStore) => lovedStore.id !== store.id,
      );
      user.lovedStores = lovedStoresUser;
    } else {
      // Add the store to lovedStoresUser if it does not exist
      lovedStoresUser.push(store);
      user.lovedStores = lovedStoresUser;
    }

    return await this.userRepository.save(user);
  }

  async updateScore(updateScoreDto: UpdateScoreDto) {
    const store = await this.storeRepository.findOne({
      where: {
        id: updateScoreDto.storeId,
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (updateScoreDto.type === TypeScore.PLUS) {
      store.score = store.score + updateScoreDto.amount;
    } else if (updateScoreDto.type === TypeScore.MINUS) {
      store.score = store.score - updateScoreDto.amount;
    }

    return await this.storeRepository.save(store);
  }
}
