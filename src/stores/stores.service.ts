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
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }
}
