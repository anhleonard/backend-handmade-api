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
import { PaymentService } from 'src/payment/payment.service';
import * as moment from 'moment';
import { StoreEntity } from 'src/stores/entities/stores.entity';
import { EnumScore } from 'src/constants/enums';

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
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
    @Inject(forwardRef(() => ProductsService))
    private readonly productService: ProductsService,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
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

    if (createOrderDto.isPaid) {
      orderEntity.isPaid = true;
      orderEntity.status = OrderStatus.PROCESSING;
      orderEntity.processingAt = new Date();
    } else {
      orderEntity.isPaid = false;
      orderEntity.status = OrderStatus.WAITING_PAYMENT;
    }

    if (createOrderDto?.apptransid) {
      orderEntity.apptransid = createOrderDto?.apptransid;
    }

    if (createOrderDto?.zp_trans_id) {
      orderEntity.zp_trans_id = createOrderDto?.zp_trans_id;
    }

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
      updateOrderDto.status !== OrderStatus.PROCESSING &&
      updateOrderDto.status !== OrderStatus.OVERDATE
    ) {
      throw new BadRequestException(
        `Processing or Overdate after waiting payment`,
      );
    }

    if (
      order.status === OrderStatus.PROCESSING &&
      updateOrderDto.status != OrderStatus.DELIVERED &&
      updateOrderDto.status !== OrderStatus.OVERDATE
    ) {
      throw new BadRequestException(
        `Delivery or Overdate after processing !!!`,
      );
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
      const store = order.store;
      store.score = store.score + EnumScore.ORDER_SUCCESS;
      await this.storeRepository.save(store);
    }

    if (updateOrderDto.status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }

    if (updateOrderDto?.isMinusPoint) {
      order.isMinusPoint = true;
    } else if (!updateOrderDto?.isMinusPoint) {
      order.updatedBy = currentUser;
    }

    order.status = updateOrderDto.status;
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

    if (
      query?.status === OrderStatus.WAITING_PAYMENT ||
      query?.status === OrderStatus.PROCESSING
    ) {
      builder.orderBy('orders.orderAt', 'DESC');
    }

    //NEW_ORDER có nghĩa là vừa mới order
    if (query?.action === 'NEW_ORDER') {
      builder.orderBy('orders.orderAt', 'DESC');
      builder.andWhere('(orders.status != :status)', {
        status: OrderStatus.CENCELLED,
      });
    }

    //NEW_CANCEL có nghĩa là vừa mới hủy
    if (query?.action === 'NEW_CANCEL') {
      builder.orderBy('orders.updatedAt', 'DESC');
      builder.andWhere('(orders.status = :status)', {
        status: OrderStatus.CENCELLED,
      });
    }

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

    if (query?.orderAt) {
      const orderDate = moment(query.orderAt)
        .startOf('day')
        .format('YYYY-MM-DD');

      builder.andWhere('DATE(orders.orderAt) = :orderDate', { orderDate });
    }

    if (query?.clientName) {
      const name = query.clientName.toLowerCase();
      builder
        .leftJoinAndSelect('orders.client', 'client')
        .andWhere('(LOWER(client.name) LIKE :name)', {
          name: `%${name}%`,
        });
    }

    if (query?.storeName) {
      const name = query.storeName.toLowerCase();
      builder
        .leftJoinAndSelect('orders.store', 'store')
        .andWhere('(LOWER(store.name) LIKE :name)', {
          name: `%${name}%`,
        });
    }

    //check xem hạn xác nhận order đã hết chưa
    // const now = Date.now();
    // if (query?.overDate === 'false') {
    //   builder.andWhere('EXTRACT(EPOCH FROM orders.orderAt) > :now', {
    //     now: (now - 7 * 24 * 60 * 60) / 1000,
    //   });
    // } else if (query?.overDate === 'true') {
    //   builder.andWhere('EXTRACT(EPOCH FROM orders.orderAt) <= :now', {
    //     now: (now - 7 * 24 * 60 * 60) / 1000,
    //   });
    // }

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
            variant: {
              variantItems: true,
            },
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

  async deleteOrder(id: number) {
    const order = await this.orderRepository.findOne({
      where: {
        id,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return await this.orderRepository.remove(order);
  }

  async sellerFilterOrders(query: any, currentUser: UserEntity) {
    try {
      const builder = this.orderRepository.createQueryBuilder('orders');

      builder
        .leftJoinAndSelect('orders.store', 'store')
        .leftJoinAndSelect('store.owner', 'owner')
        .where('owner.id = :id', {
          id: currentUser.id,
        });

      if (query?.status) {
        builder.andWhere('(orders.status = :status)', {
          status: query?.status,
        });
      }

      if (query?.orderAt) {
        const orderDate = moment(query.orderAt)
          .startOf('day')
          .format('YYYY-MM-DD');

        builder.andWhere('DATE(orders.orderAt) = :orderDate', { orderDate });
      }

      if (query?.clientName) {
        const name = query.clientName.toLowerCase();
        builder
          .leftJoinAndSelect('orders.client', 'client')
          .andWhere('(LOWER(client.name) LIKE :name)', {
            name: `%${name}%`,
          });
      }

      const page: number = parseInt(query?.page as any) || 1;
      let perPage = 25;
      if (query?.limit) {
        perPage = query?.limit;
      }
      const total = await builder.getCount();

      builder.offset((page - 1) * perPage).limit(perPage);

      if (query?.code) {
        builder.andWhere('(orders.code = :code)', {
          code: query?.code,
        });
      }

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
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  calculateRevenue = (data: OrderEntity[]) => {
    const result = {};
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 8);

    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}`;
    };

    // Khởi tạo các ngày với doanh thu bằng 0 và số lượng đơn hàng bằng 0
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = formatDate(date);
      result[dateStr] = { revenue: 0, totalOrder: 0, orderDate: dateStr };
    }

    data.forEach((order) => {
      const orderDate = new Date(order.orderAt.toString()); // Chuyển đổi Timestamp thành Date
      if (
        orderDate.getTime() >= startDate.getTime() &&
        orderDate.getTime() < today.getTime()
      ) {
        const dateStr = formatDate(orderDate);
        result[dateStr].revenue += order.totalPayment;
        result[dateStr].totalOrder += 1;
      }
    });

    return Object.values(result);
  };

  async getOrderSales() {
    const shippedOrders = await this.orderRepository.find({
      where: {
        status: OrderStatus.SHIPPED,
      },
    });

    const canceledOrders = await this.orderRepository.find({
      where: {
        status: OrderStatus.CENCELLED,
      },
    });

    const allOrders = await this.orderRepository.find();

    const totalRevenue = shippedOrders.reduce(
      (total, order) => total + order.totalPayment,
      0,
    );

    const revenueSevenDays = this.calculateRevenue(shippedOrders);

    return {
      totalRevenue,
      savedMoney: totalRevenue * 0.2,
      totalOrder: shippedOrders?.length,
      revenueSevenDays: revenueSevenDays.reverse(),
      allOrdersNumber: allOrders?.length,
      rateShippedOrder: allOrders?.length
        ? Math.round((shippedOrders?.length / allOrders?.length) * 100)
        : 0,
      rateCanceledOrder: allOrders?.length
        ? Math.round((canceledOrders?.length / allOrders?.length) * 100)
        : 0,
    };
  }
}
