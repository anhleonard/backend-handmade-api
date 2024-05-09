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
import { ShippingsService } from './shippings.service';
import { AuthenticationGuard } from 'src/utility/guards/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guards/authorization.guard';
import { Roles } from 'src/utility/common/user-roles.enum';
import { CurrentUser } from 'src/utility/decorators/current-user.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import { ShippingEntity } from './entities/shipping.entity';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';

@Controller('shippings')
@UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.USER]))
export class ShippingsController {
  constructor(private readonly shippingsService: ShippingsService) {}

  @Post('/create')
  async create(
    @Body() createShippingDto: CreateShippingDto,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<ShippingEntity> {
    return await this.shippingsService.create(createShippingDto, currentUser);
  }

  @Post('')
  async findAllByUser(
    @Body('userId') userId: number,
  ): Promise<ShippingEntity[]> {
    return await this.shippingsService.findAllByUser(+userId);
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.USER, Roles.ADMIN]))
  @Get('/:id')
  async findOne(@Param('id') id: number): Promise<ShippingEntity> {
    return await this.shippingsService.findOne(+id);
  }

  @Put('/update/:id')
  async update(
    @Param('id') id: number,
    @Body() updateShippingDto: UpdateShippingDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.shippingsService.update(
      id,
      updateShippingDto,
      currentUser,
    );
  }

  @Delete('/delete/:id')
  async delete(
    @Param('id') id: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.shippingsService.delete(id, currentUser);
  }
}
