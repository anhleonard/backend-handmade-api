import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from 'src/users/entities/user.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { StoreEntity } from './entities/stores.entity';
import { Repository } from 'typeorm';
import { UpdateStoreDto } from './dto/update-store.dto';
import { ProductStatus } from 'src/products/enum/product.enum';

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
}
