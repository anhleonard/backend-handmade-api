import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderProductDto } from './dto/create-order-product.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderProductEntity } from './entities/order-products.entity';
import { Repository } from 'typeorm';
import { ProductEntity } from 'src/products/entities/product.entity';
import { VariantEntity } from 'src/variants/entities/variant.entity';
import { UpdateOrderProductDto } from './dto/update-order-product.dto';
import { ProductStatus } from 'src/products/enum/product.enum';

@Injectable()
export class OrderProductsService {
  constructor(
    @InjectRepository(OrderProductEntity)
    private readonly orderProductRepository: Repository<OrderProductEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(VariantEntity)
    private readonly variantRepository: Repository<VariantEntity>,
  ) {}

  async create(
    createOrderProductDto: CreateOrderProductDto,
    currentUser: UserEntity,
  ) {
    const product = await this.productRepository.findOne({
      where: {
        id: createOrderProductDto.productId,
      },
      relations: {
        variants: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // TH1: CÓ VARIANT
    if (createOrderProductDto.variantId) {
      const variant = await this.variantRepository.findOne({
        where: {
          id: createOrderProductDto.variantId,
          product: {
            id: createOrderProductDto.productId,
          },
        },
      });

      if (!variant) {
        throw new NotFoundException('Variant of this product not found');
      }

      if (variant.inventoryNumber < createOrderProductDto.productQuantity) {
        throw new BadRequestException(
          'Not enough available quantity to order.',
        );
      }

      const foundOrderProduct = await this.orderProductRepository.findOne({
        where: {
          product: {
            id: createOrderProductDto.productId,
          },
          variant: {
            id: createOrderProductDto.variantId,
          },
          client: {
            id: currentUser.id,
          },
        },
        relations: {
          product: true,
          variant: true,
          client: true,
        },
      });

      if (!foundOrderProduct) {
        const newOrderProduct = {
          productUnitPrice: variant.unitPrice,
          productQuantity: createOrderProductDto.productQuantity,
          ...(createOrderProductDto?.isSelected && {
            isSelected: createOrderProductDto?.isSelected,
          }),
        };

        const orderProduct =
          this.orderProductRepository.create(newOrderProduct);

        orderProduct.product = product;
        orderProduct.variant = variant;
        orderProduct.client = currentUser;
        orderProduct.code = Math.random().toString();

        return await this.orderProductRepository.save(orderProduct);
      } else {
        const updatedOrderProduct = {
          productUnitPrice: variant.unitPrice,
          productQuantity: createOrderProductDto.productQuantity,
          ...(createOrderProductDto?.isSelected && {
            isSelected: createOrderProductDto?.isSelected,
          }),
        };

        Object.assign(foundOrderProduct, updatedOrderProduct);
        return await this.orderProductRepository.save(foundOrderProduct);
      }
    }

    // TH2: KHÔNG CÓ VARIANT
    if (!createOrderProductDto.variantId) {
      if (createOrderProductDto.productQuantity > product.inventoryNumber) {
        throw new BadRequestException(
          'Not enough available quantity to order.',
        );
      }

      const foundOrderProduct = await this.orderProductRepository.findOne({
        where: {
          product: {
            id: createOrderProductDto.productId,
          },
          client: {
            id: currentUser.id,
          },
        },
        relations: {
          product: true,
          client: true,
        },
      });

      if (!foundOrderProduct) {
        const newOrderProduct = {
          productUnitPrice: product.price,
          productQuantity: createOrderProductDto.productQuantity,
          ...(createOrderProductDto?.isSelected && {
            isSelected: createOrderProductDto?.isSelected,
          }),
        };

        const orderProduct =
          this.orderProductRepository.create(newOrderProduct);

        orderProduct.product = product;
        orderProduct.client = currentUser;
        orderProduct.code = Math.random().toString();

        return await this.orderProductRepository.save(orderProduct);
      } else {
        const updatedOrderProduct = {
          productUnitPrice: product.price,
          productQuantity: createOrderProductDto.productQuantity,
          ...(createOrderProductDto?.isSelected && {
            isSelected: createOrderProductDto?.isSelected,
          }),
        };
        Object.assign(foundOrderProduct, updatedOrderProduct);
        return await this.orderProductRepository.save(foundOrderProduct);
      }
    }
  }

  async findOne(id: number): Promise<OrderProductEntity> {
    const orderProduct = await this.orderProductRepository.findOne({
      where: {
        id,
      },
    });

    if (!orderProduct) {
      throw new NotFoundException('Order product not found.');
    }

    return orderProduct;
  }

  async getOrderProductsByUser(currentUser: UserEntity) {
    const storeRawOrders = [];

    const orderProducts = await this.orderProductRepository.find({
      where: {
        client: {
          id: currentUser.id,
        },
        product: {
          status: ProductStatus.SELLING,
        },
      },
      relations: {
        client: true,
        variant: {
          variantItems: true,
        },
        product: {
          store: true,
        },
      },
    });

    if (!orderProducts) {
      throw new NotFoundException('Order products not found.');
    }

    let currentStoreId = -99999999999;
    let existedStoreIds: number[] = [];

    for (let rawOrder of orderProducts) {
      const storeId = rawOrder.product?.store?.id; // Lấy ID của cửa hàng của sản phẩm đầu tiên (giả sử tồn tại)
      if (currentStoreId !== storeId && !existedStoreIds.includes(storeId)) {
        existedStoreIds.push(storeId);
        currentStoreId = storeId;
        const orderProductsSameStore = orderProducts.filter((orderProduct) => {
          return orderProduct.product.store.id === storeId;
        });
        const storeRawOrder = {
          store: rawOrder.product?.store,
          orderProducts: orderProductsSameStore,
        };
        storeRawOrders.push(storeRawOrder);
      }
    }

    return storeRawOrders;
  }

  async update(
    id: number,
    updateOrderProductDto: UpdateOrderProductDto,
    currentUser: UserEntity,
  ) {
    const orderProduct = await this.orderProductRepository.findOne({
      where: {
        id,
        client: {
          id: currentUser.id,
        },
      },
    });

    if (!orderProduct) {
      throw new NotFoundException('Order product not found to update');
    }

    Object.assign(orderProduct, updateOrderProductDto);

    return await this.orderProductRepository.save(orderProduct);
  }

  async remove(
    id: number,
    currentUser: UserEntity,
  ): Promise<OrderProductEntity> {
    const orderProduct = await this.orderProductRepository.findOne({
      where: {
        id,
        client: {
          id: currentUser.id,
        },
      },
    });

    if (!orderProduct) {
      throw new NotFoundException('Order product not found to remove');
    }

    return await this.orderProductRepository.remove(orderProduct);
  }

  async getSelectedOrderProducts(currentUser: UserEntity) {
    const selectedOrderProducts = [];

    const orderProducts = await this.orderProductRepository.find({
      where: {
        client: {
          id: currentUser.id,
        },
        isSelected: true,
      },
      relations: {
        client: true,
        variant: {
          variantItems: true,
        },
        product: {
          store: true,
        },
      },
    });

    if (!orderProducts) {
      throw new NotFoundException('Order products not found.');
    }

    let currentStoreId = -99999999999;
    let existedStoreIds: number[] = [];

    for (let rawOrder of orderProducts) {
      const storeId = rawOrder.product?.store?.id; // Lấy ID của cửa hàng của sản phẩm đầu tiên (giả sử tồn tại)
      if (currentStoreId !== storeId && !existedStoreIds.includes(storeId)) {
        existedStoreIds.push(storeId);
        currentStoreId = storeId;
        const orderProductsSameStore = orderProducts.filter((orderProduct) => {
          return orderProduct.product.store.id === storeId;
        });
        const storeRawOrder = {
          store: rawOrder.product?.store,
          orderProducts: orderProductsSameStore,
        };
        selectedOrderProducts.push(storeRawOrder);
      }
    }

    return selectedOrderProducts;
  }
}
