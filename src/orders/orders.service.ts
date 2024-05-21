import {
  Injectable,
  NotFoundException,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { Repository } from 'typeorm';
import { ProductEntity } from 'src/products/entities/product.entity';
import { ProductsService } from 'src/products/products.service';
import { OrderStatus } from './enums/order-status.enum';
import { ShippingEntity } from 'src/shippings/entities/shipping.entity';
import { OrderProductEntity } from '../order_products/entities/order-products.entity';
import { VariantEntity } from 'src/variants/entities/variant.entity';
import { CancelOrderDto } from './dto/cancel-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderProductEntity)
    private readonly opRepository: Repository<OrderProductEntity>,
    @InjectRepository(ShippingEntity)
    private readonly shippingRepository: Repository<ShippingEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(VariantEntity)
    private readonly variantRepository: Repository<VariantEntity>,
    @Inject(forwardRef(() => ProductsService))
    private readonly productService: ProductsService,
  ) {}
  async create(createOrderDto: CreateOrderDto, currentUser: UserEntity) {
    const shippingEntity = await this.shippingRepository.findOne({
      where: {
        id: createOrderDto.shippingAddressId,
        user: {
          id: currentUser.id,
        },
      },
    });

    if (!shippingEntity) {
      throw new NotFoundException('shipping address not found.');
    }

    let orderProducts = [];
    let provisionalAmount = 0;
    let discountAmount = 0;
    let totalPayment = 0;

    for (let id of createOrderDto.orderedProductIds) {
      const orderProduct = await this.opRepository.findOne({
        where: {
          id,
          isSelected: true,
          client: {
            id: currentUser.id,
          },
        },
        relations: {
          client: true,
          product: {
            store: true,
          },
          variant: true,
        },
      });

      if (!orderProduct) {
        break;
      }

      let updatedProduct = Object.assign({}, orderProduct.product);

      //check xem còn đủ hàng không <in cart của client và in stock của seller>
      if (
        orderProduct?.variant &&
        orderProduct.productQuantity > orderProduct?.variant.inventoryNumber
      ) {
        throw new BadRequestException('Not enough quantity to order.');
      }

      if (
        !orderProduct?.variant &&
        orderProduct.productQuantity > orderProduct?.product?.inventoryNumber
      ) {
        throw new BadRequestException('Not enough quantity to order.');
      }

      //update inventoryNumber trong product gốc
      if (!orderProduct?.variant) {
        // const updatedProduct = Object.assign({}, orderProduct.product);
        updatedProduct.inventoryNumber =
          orderProduct?.product?.inventoryNumber - orderProduct.productQuantity;
      } else if (orderProduct?.variant) {
        //update inventory trong vatiant
        const updatedVariant = Object.assign({}, orderProduct?.variant);
        updatedVariant.inventoryNumber =
          orderProduct?.variant.inventoryNumber - orderProduct.productQuantity;

        //update inventory trong product
        updatedProduct.inventoryNumber =
          orderProduct.product.inventoryNumber - orderProduct.productQuantity;

        await this.variantRepository.save(updatedVariant);
      }

      //tạm tính tiền
      provisionalAmount +=
        orderProduct.productUnitPrice * orderProduct.productQuantity;

      orderProducts.push(orderProduct);

      //sold number chỉ update khi mà order về trạng thái success
      // updatedProduct.soldNumber =
      //   orderProduct.product.soldNumber + orderProduct.productQuantity;

      await this.productRepository.save(updatedProduct);
    }

    //tính tổng tiền sau giảm + phí giao hàng
    totalPayment =
      provisionalAmount - discountAmount + createOrderDto?.deliveryFee;

    if (orderProducts.length === 0) {
      throw new BadRequestException('No item can be sold.');
    }

    const orderEntity = new OrderEntity();

    //update thông tin giá cả
    orderEntity.totalAmountItem = orderProducts.length;
    orderEntity.provisionalAmount = provisionalAmount;
    orderEntity.discountAmount = discountAmount;
    orderEntity.deliveryFee = createOrderDto?.deliveryFee;
    orderEntity.totalPayment = totalPayment;

    //thông tin các relations
    orderEntity.shippingAddress = shippingEntity;
    orderEntity.client = currentUser;
    orderEntity.orderProducts = orderProducts;
    orderEntity.store = orderProducts[0]?.product?.store;

    orderEntity.code = this.generateRandomOrderCode(14);

    return await this.orderRepository.save(orderEntity);
  }

  generateRandomOrderCode(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charactersLength);
      result += characters.charAt(randomIndex);
    }

    return result;
  }

  async findAll(): Promise<OrderEntity[]> {
    return await this.orderRepository.find({
      relations: {
        shippingAddress: true,
        client: true,
        orderProducts: {
          product: {
            store: true,
          },
        },
      },
    });
  }

  async findOne(id: number): Promise<OrderEntity> {
    return await this.orderRepository.findOne({
      where: { id },
      relations: {
        store: true,
        shippingAddress: true,
        client: true,
        orderProducts: {
          variant: {
            variantItems: true,
          },
          product: true,
        },
        updatedBy: true,
      },
    });
  }

  async findOneByProductId(id: number) {
    return await this.opRepository.findOne({
      relations: { product: true },
      where: { product: { id: id } },
    });
  }

  async update(
    id: number,
    updateOrderDto: UpdateOrderDto,
    currentUser: UserEntity,
  ) {
    if (updateOrderDto.status === OrderStatus.CENCELLED) {
      throw new BadRequestException(`Go to cancel route`);
    }

    let order = await this.findOne(id);
    if (!order) throw new NotFoundException('Order not found');

    if (
      order.status === OrderStatus.WAITING_PAYMENT &&
      updateOrderDto.status !== OrderStatus.PROCESSING
    ) {
      throw new BadRequestException(`Processing after waiting payment`);
    }

    if (
      order.status === OrderStatus.PROCESSING &&
      updateOrderDto.status != OrderStatus.DELIVERED
    ) {
      throw new BadRequestException(`Delivery after processing !!!`);
    }

    if (
      order.status === OrderStatus.DELIVERED &&
      updateOrderDto.status !== OrderStatus.SHIPPED
    ) {
      throw new BadRequestException(`Shipping after delivery!`);
    }

    if (
      updateOrderDto.status === OrderStatus.SHIPPED &&
      order.status === OrderStatus.SHIPPED
    ) {
      return order;
    }

    if (updateOrderDto.status === OrderStatus.PROCESSING) {
      order.processingAt = new Date();
    }

    if (updateOrderDto.status === OrderStatus.SHIPPED) {
      order.shippedAt = new Date();
      order.isPaid = true;
    }

    if (updateOrderDto.status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }

    order.status = updateOrderDto.status;
    order.updatedBy = currentUser;
    order.updatedAt = new Date();
    order = await this.orderRepository.save(order);

    //update sold number nếu đơn hàng đã giao
    if (updateOrderDto.status === OrderStatus.SHIPPED) {
      for (let op of order.orderProducts) {
        await this.updateSoldNumber(op);
      }
    }

    return order;
  }

  async updateSoldNumber(op: OrderProductEntity) {
    const product = await this.productRepository.findOne({
      where: {
        id: op.product.id,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    product.soldNumber = product.soldNumber + op.productQuantity;
    await this.productRepository.save(product);
  }

  async cancelled(
    id: number,
    cancelOrderDto: CancelOrderDto,
    currentUser: UserEntity,
  ) {
    let order = await this.orderRepository.findOne({
      where: {
        id,
      },
      relations: {
        orderProducts: {
          variant: true,
          product: {
            variants: true,
          },
        },
      },
    });

    if (
      order.status === OrderStatus.DELIVERED ||
      order.status === OrderStatus.SHIPPED ||
      order.status === OrderStatus.CENCELLED
    ) {
      throw new BadRequestException(`Not permission to cancel order.`);
    }

    if (!order) throw new NotFoundException('Order Not Found.');

    if (
      order.status === OrderStatus.DELIVERED ||
      order.status === OrderStatus.SHIPPED
    ) {
      throw new BadRequestException('Not permission to cancel order.');
    }

    if (order.status === OrderStatus.CENCELLED) return order;

    order.isCanceled = true;
    order.canceledReason = cancelOrderDto.canceledReason;
    order.updatedAt = new Date();
    order.status = OrderStatus.CENCELLED;
    order.updatedBy = currentUser;
    order = await this.orderRepository.save(order);
    await this.stockUpdate(order, OrderStatus.CENCELLED);
    return order;
  }

  async stockUpdate(order: OrderEntity, status: string) {
    for (const op of order.orderProducts) {
      if (!op.variant) {
        await this.updateStockNotVariant(op);
      } else {
        await this.updateStockHaveVariant(op);
      }
    }
  }

  async updateStockNotVariant(op: OrderProductEntity) {
    const product = await this.productRepository.findOne({
      where: {
        id: op.product.id,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    product.inventoryNumber = product.inventoryNumber + op.productQuantity;

    return await this.productRepository.save(product);
  }

  async updateStockHaveVariant(op: OrderProductEntity) {
    const product = await this.productRepository.findOne({
      where: {
        id: op.product.id,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    //update stock in product
    product.inventoryNumber = product.inventoryNumber + op.productQuantity;

    //update stock in variant
    const variant = await this.variantRepository.findOne({
      where: {
        id: op.variant.id,
      },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found.');
    }

    variant.inventoryNumber = variant.inventoryNumber + op.productQuantity;

    await this.variantRepository.save(variant);
    return await this.productRepository.save(product);
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  async getOrdersByUser(
    currentUser: UserEntity,
    orderByStatus: UpdateOrderDto,
  ) {
    const orders = await this.orderRepository.find({
      where: {
        client: {
          id: currentUser.id,
        },
        status: orderByStatus.status,
      },
      relations: {
        client: true,
        store: true,
        orderProducts: {
          product: true,
          variant: {
            variantItems: true,
          },
        },
      },
    });

    if (!orders) {
      throw new NotFoundException('Orders not found.');
    }

    return orders;
  }

  async getOrdersBySeller(
    currentUser: UserEntity,
    orderByStatus: UpdateOrderDto,
  ) {
    const orders = await this.orderRepository.find({
      where: {
        store: {
          owner: {
            id: currentUser?.id,
          },
        },
        status: orderByStatus.status,
      },
      relations: {
        client: true,
        store: true,
        orderProducts: {
          product: true,
          variant: {
            variantItems: true,
          },
        },
        shippingAddress: true,
        updatedBy: true,
      },
    });

    if (!orders) {
      throw new NotFoundException('Orders not found.');
    }

    return orders;
  }

  async updateReadyForAdmin(id: number, currentUser: UserEntity) {
    let order = await this.orderRepository.findOne({
      where: {
        id,
        status: OrderStatus.PROCESSING,
        isReadyDelivery: false,
        store: {
          owner: {
            id: currentUser?.id,
          },
        },
      },
      relations: {
        client: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.isReadyDelivery = true;
    return await this.orderRepository.save(order);
  }

  async adminFilterOrders(query: any) {
    const builder = this.orderRepository.createQueryBuilder('orders');

    if (query?.status) {
      builder.andWhere('(orders.status = :status)', {
        status: query?.status,
      });
    }

    if (query?.code) {
      builder.andWhere('(orders.code = :code)', {
        code: query?.code,
      });
    }

    if (query?.isReadyDelivery) {
      builder.andWhere('(orders.isReadyDelivery = :isReadyDelivery)', {
        isReadyDelivery: query?.isReadyDelivery,
      });
    }

    const page: number = parseInt(query?.page as any) || 1;
    let perPage = 25;
    if (query?.limit) {
      perPage = query?.limit;
    }
    const total = await builder.getCount();

    builder.offset((page - 1) * perPage).limit(perPage);

    // CUSTOM ORDERS
    const orders = await builder.getMany();

    const customOrders: OrderEntity[] = [];

    for (let order of orders) {
      const foundOrder = await this.orderRepository.findOne({
        where: {
          id: order.id,
        },
        relations: {
          store: true,
          client: true,
          orderProducts: {
            product: true,
            variant: true,
          },
          updatedBy: true,
        },
      });

      customOrders.push(foundOrder);
    }

    return {
      data: customOrders,
      total,
      page,
      last_page: Math.ceil(total / perPage),
    };
  }
}
