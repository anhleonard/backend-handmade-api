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

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderProductEntity)
    private readonly opRepository: Repository<OrderProductEntity>,
    @InjectRepository(ShippingEntity)
    private readonly shippingRepository: Repository<ShippingEntity>,
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
        },
      });

      if (orderProduct) {
        //tạm tính tiền
        provisionalAmount +=
          orderProduct.productUnitPrice * orderProduct.productQuantity;

        orderProducts.push(orderProduct);
      }
    }

    //tính tổng tiền sau giảm
    totalPayment = provisionalAmount - discountAmount;

    if (orderProducts.length === 0) {
      throw new BadRequestException('No item can be sold.');
    }

    const orderEntity = new OrderEntity();

    //update thông tin giá cả
    orderEntity.totalAmountItem = orderProducts.length;
    orderEntity.provisionalAmount = provisionalAmount;
    orderEntity.discountAmount = discountAmount;
    orderEntity.totalPayment = totalPayment;

    //thông tin các relations
    orderEntity.shippingAddress = shippingEntity;
    orderEntity.client = currentUser;
    orderEntity.orderProducts = orderProducts;
    orderEntity.store = orderProducts[0]?.product?.store;

    return await this.orderRepository.save(orderEntity);
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
        shippingAddress: true,
        client: true,
        orderProducts: { product: true },
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
    if (updateOrderDto.status && !updateOrderDto.isAccepted) {
      throw new BadRequestException(`Order is not accepted by seller`);
    }

    if (!updateOrderDto.isAccepted) {
      throw new BadRequestException(`Order has no update`);
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
      order.status === OrderStatus.DELIVERED ||
      order.status === OrderStatus.CENCELLED
    ) {
      throw new BadRequestException(`Order already ${order.status}`);
    }

    if (
      order.status === OrderStatus.PROCESSING &&
      updateOrderDto.status != OrderStatus.SHIPPED
    ) {
      throw new BadRequestException(`Delivery before shipped !!!`);
    }

    if (
      updateOrderDto.status === OrderStatus.SHIPPED &&
      order.status === OrderStatus.SHIPPED
    ) {
      return order;
    }

    if (updateOrderDto.status === OrderStatus.SHIPPED) {
      order.shippedAt = new Date();
    }

    if (updateOrderDto.status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }

    order.status = updateOrderDto.status;
    order.updatedBy = currentUser;
    order = await this.orderRepository.save(order);
    if (updateOrderDto.status === OrderStatus.DELIVERED) {
      await this.stockUpdate(order, OrderStatus.DELIVERED);
    }
    return order;
  }

  async cancelled(id: number, currentUser: UserEntity) {
    let order = await this.findOne(id);
    if (!order) throw new NotFoundException('Order Not Found.');

    if (order.status === OrderStatus.CENCELLED) return order;

    order.status = OrderStatus.CENCELLED;
    order.updatedBy = currentUser;
    order = await this.orderRepository.save(order);
    await this.stockUpdate(order, OrderStatus.CENCELLED);
    return order;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  async stockUpdate(order: OrderEntity, status: string) {
    for (const op of order.orderProducts) {
      await this.productService.updateStock(
        op.product.id,
        op.productQuantity,
        status,
      );
    }
  }
}
