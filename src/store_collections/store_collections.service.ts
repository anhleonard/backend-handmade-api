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

    let productsNotInCollection: ProductEntity[] = [];

    for (let productId of productIds) {
      const productOfStore = await this.productRepository.findOne({
        where: {
          id: productId,
          addedBy: {
            id: currentUser.id,
          },
        },
        relations: {
          addedBy: true,
        },
      });

      if (productOfStore) {
        if (productOfStore?.collection) {
          console.log('product in collection', productId);
        } else {
          productsNotInCollection.push(productOfStore);
        }
      }
    }

    let collection = this.collectionRepository.create(createCollectionDto);

    collection.store = seller.store;

    collection.products = productsNotInCollection;

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

    //check collection này có trong store chưa // check theo name
    const itemCollection = await this.collectionRepository.findOne({
      where: {
        name: updateCollectionDto.name,
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

    if (!collection.products) {
      throw new NotFoundException('Collection has no product');
    }

    let productsOfStoreNotInCollection: ProductEntity[] = [];

    for (let productId of updateCollectionDto.collectionProductIds) {
      const productOfStore = await this.productRepository.findOne({
        where: {
          id: productId,
          addedBy: {
            id: currentUser.id,
          },
        },
        relations: {
          addedBy: true,
          collection: true,
        },
      });

      //product of store not in collection
      if (productOfStore && productOfStore?.collection == null) {
        productsOfStoreNotInCollection.push(productOfStore);
      }
    }

    //combine products to put into collection
    const finalProducts = collection.products.concat(
      productsOfStoreNotInCollection,
    );

    collection.products = finalProducts;

    return await this.collectionRepository.save(collection);
  }

  async getStoreCollections(storeId: number) {
    const collections = await this.collectionRepository.findOne({
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
      throw new NotFoundException('Collection of store not found');
    }

    return collections;
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
        collection: {
          id: collectionId,
        },
      },
      relations: {
        collection: true,
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
}
