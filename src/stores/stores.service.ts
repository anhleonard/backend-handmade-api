import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from 'src/users/entities/user.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { StoreEntity } from './entities/stores.entity';
import { Connection, MoreThan, Repository, getConnection } from 'typeorm';
import { UpdateStoreDto } from './dto/update-store.dto';
import { ProductStatus } from 'src/products/enum/product.enum';
import { OrderStatus } from 'src/orders/enums/order-status.enum';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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

      const updatedStore = seller.store;

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

    Object.assign(store, updateStoreDto);

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

      // Tìm xem ngày này đã tồn tại trong mảng chưa
      const existingDay = store.orders.find(
        (order) =>
          new Date(order.orderAt.toString()).toISOString().split('T')[0] ===
          orderDate,
      );

      if (existingDay) {
        // Nếu ngày đã tồn tại, thêm vào mảng revenueByDay
        revenueByDay.push({
          orderDate: orderDate,
          orderAt: this.formatDate(orderDate),
          totalRevenue: existingDay.provisionalAmount,
          totalOrders: 1,
        });
      } else {
        // Nếu ngày không tồn tại, thêm vào mảng revenueByDay với totalRevenue và totalOrders là 0
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

    const store = await this.storeRepository.findOne({
      where: {
        owner: {
          id: currentUser.id,
        },
        orders: {
          status: OrderStatus.SHIPPED,
          orderAt: MoreThan(thirtyDaysAgo),
        },
      },
      relations: {
        orders: {
          orderProducts: {
            product: true,
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
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
}
