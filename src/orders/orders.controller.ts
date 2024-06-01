import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthenticationGuard } from 'src/utility/guards/authentication.guard';
import { CurrentUser } from 'src/utility/decorators/current-user.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import { OrderEntity } from './entities/order.entity';
import { AuthorizeGuard } from 'src/utility/guards/authorization.guard';
import { Roles } from 'src/utility/common/user-roles.enum';
import { CancelOrderDto } from './dto/cancel-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('/seller-filter-orders')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  async sellerFilterOrders(
    @Query() query: any,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.ordersService.sellerFilterOrders(query, currentUser);
  }

  @Get('/admin-filter-orders')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  async adminFilterOrders(@Query() query: any) {
    return await this.ordersService.adminFilterOrders(query);
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.USER]))
  @Post('/create')
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.ordersService.create(createOrderDto, currentUser);
  }

  @Get()
  async findAll(): Promise<OrderEntity[]> {
    return await this.ordersService.findAll();
  }

  @UseGuards(AuthenticationGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<OrderEntity> {
    return await this.ordersService.findOne(+id);
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER, Roles.ADMIN]))
  @Put('/update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.ordersService.update(+id, updateOrderDto, currentUser);
  }

  @UseGuards(AuthenticationGuard)
  @Put('cancel/:id')
  async cancelled(
    @Param('id') id: string,
    @Body() cancelOrderDto: CancelOrderDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.ordersService.cancelled(+id, cancelOrderDto, currentUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.USER]))
  @Post('/client-orders')
  async getOrdersByUser(
    @Body() orderByStatus: UpdateOrderDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.ordersService.getOrdersByUser(currentUser, orderByStatus);
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Post('/seller-orders/')
  async getOrdersBySeller(
    @Body() orderByStatus: UpdateOrderDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.ordersService.getOrdersBySeller(
      currentUser,
      orderByStatus,
    );
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Put('/update-ready-delivery/:id')
  async updateReadyForAdmin(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.ordersService.updateReadyForAdmin(+id, currentUser);
  }

  @Delete('/delete/:id')
  async deleteOrder(@Param('id') id: string) {
    return await this.ordersService.deleteOrder(+id);
  }
}
