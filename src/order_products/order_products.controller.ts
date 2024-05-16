import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { OrderProductsService } from './order_products.service';
import { AuthenticationGuard } from 'src/utility/guards/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guards/authorization.guard';
import { Roles } from 'src/utility/common/user-roles.enum';
import { CreateOrderProductDto } from './dto/create-order-product.dto';
import { CurrentUser } from 'src/utility/decorators/current-user.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import { UpdateOrderProductDto } from './dto/update-order-product.dto';

@Controller('order-products')
export class OrderProductsController {
  constructor(private readonly orderProductsService: OrderProductsService) {}

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.USER]))
  @Post('/create')
  async create(
    @Body() createOrderProductDto: CreateOrderProductDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.orderProductsService.create(
      createOrderProductDto,
      currentUser,
    );
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.USER]))
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.orderProductsService.findOne(+id);
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.USER]))
  @Put('/update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderProductDto: UpdateOrderProductDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.orderProductsService.update(
      +id,
      updateOrderProductDto,
      currentUser,
    );
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.USER]))
  @Delete('/delete/:id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.orderProductsService.remove(+id, currentUser);
  }

  //get order products of client
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.USER]))
  @Get('/')
  async getOrderProductsByUser(@CurrentUser() currentUser: UserEntity) {
    return await this.orderProductsService.getOrderProductsByUser(currentUser);
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.USER]))
  @Post('/selected-order-products')
  async getSelectedOrderProducts(@CurrentUser() currentUser: UserEntity) {
    return await this.orderProductsService.getSelectedOrderProducts(
      currentUser,
    );
  }
}
