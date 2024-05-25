import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CollectionEntity } from './entities/collection.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCollectionDto } from './dto/create-collections.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { UpdateCollectionDto } from './dto/update-collections.dto';
import { StoreEntity } from 'src/stores/entities/stores.entity';

@Injectable()
export class StoreCollectionsService {
  constructor(
    @InjectRepository(CollectionEntity)
    private readonly collectionRepository: Repository<CollectionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
  ) {}

  async create(
    createCollectionDto: CreateCollectionDto,
    currentUser: UserEntity,
  ) {
    //check xem seller có store không
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

    //check collection này có trong store chưa
    const itemCollection = await this.collectionRepository.findOne({
      where: {
        name: createCollectionDto.name,
        store: {
          id: seller.store.id,
        },
      },
      relations: {
        store: true,
      },
    });

    if (itemCollection) {
      throw new BadRequestException('This collection is available in store.');
    }

    const productIds = createCollectionDto.collectionProductIds;

    let filteredProducts: ProductEntity[] = [];

    for (let productId of productIds) {
      const productOfStore = await this.productRepository.findOne({
        where: {
          id: productId,
        },
      });

      if (productOfStore) {
        filteredProducts.push(productOfStore);
      }
    }

    let collection = this.collectionRepository.create(createCollectionDto);

    collection.store = seller.store;

    collection.products = filteredProducts;

    return await this.collectionRepository.save(collection);
  }

  async update(
    collectionId: number,
    updateCollectionDto: UpdateCollectionDto,
    currentUser: UserEntity,
  ) {
    //check xem seller có store không
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

    //find collection by id of this store
    let collection = await this.collectionRepository.findOne({
      where: {
        id: collectionId,
        store: {
          id: seller.store.id,
        },
      },
      relations: {
        store: true,
        products: true,
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found in this store by id');
    }

    Object.assign(collection, updateCollectionDto);

    let filteredProducts: ProductEntity[] = [];

    for (let productId of updateCollectionDto.collectionProductIds) {
      const productOfStore = await this.productRepository.findOne({
        where: {
          id: productId,
        },
      });

      //product of store not in collection
      if (productOfStore) {
        filteredProducts.push(productOfStore);
      }
    }

    collection.products = filteredProducts;

    return await this.collectionRepository.save(collection);
  }

  async getStoreCollections(sellerId: number, query: any) {
    const builder = this.collectionRepository.createQueryBuilder('collections');

    builder
      .leftJoinAndSelect('collections.store', 'store')
      .leftJoinAndSelect('store.owner', 'owner')
      .where('owner.id = :id', { id: sellerId });

    if (query?.title) {
      const name = query.title.toLowerCase();

      builder.andWhere('LOWER(collections.name) LIKE :title', {
        title: `%${name}%`,
      });
    }

    const collections = await builder.getMany();

    if (!collections) {
      throw new NotFoundException('Collection of store not found');
    }

    let customCollections: CollectionEntity[] = [];

    for (let collection of collections) {
      const foundCollection = await this.collectionRepository.findOne({
        where: {
          id: collection.id,
        },
        relations: {
          store: true,
          products: true,
        },
      });

      customCollections.push(foundCollection);
    }

    return customCollections;
  }

  async removeProductInCollection(collectionId: number, productId: number) {
    const collection = await this.collectionRepository.findOne({
      where: {
        id: collectionId,
      },
      relations: {
        products: true,
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (!collection.products) {
      throw new NotFoundException('Collection has no product');
    }

    const productInCollect = await this.productRepository.findOne({
      where: {
        id: productId,
        collections: {
          id: collectionId,
        },
      },
      relations: {
        collections: true,
      },
    });

    if (!productInCollect) {
      throw new NotFoundException('Product of collection not found');
    }

    const newProducts = collection.products.filter(
      (item) => item.id !== productInCollect.id,
    );

    collection.products = newProducts;
    return await this.collectionRepository.save(collection);
  }

  async removeCollection(collectionId: number) {
    const collection = await this.collectionRepository.findOne({
      where: {
        id: collectionId,
      },
      relations: {
        products: true,
      },
    });

    return await this.collectionRepository.remove(collection);
  }

  async findOne(id: number) {
    const collection = await this.collectionRepository.findOne({
      where: {
        id,
      },
      relations: {
        store: true,
        products: true,
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    return collection;
  }

  async getAllStoreCollections(storeId: number) {
    const collections = await this.collectionRepository.find({
      where: {
        store: {
          id: storeId,
        },
      },
      relations: {
        store: true,
        products: true,
      },
    });

    if (!collections) {
      throw new NotFoundException('Collection not found');
    }

    return collections;
  }
}
