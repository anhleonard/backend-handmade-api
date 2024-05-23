import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { AuthenticationGuard } from 'src/utility/guards/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guards/authorization.guard';
import { Roles } from 'src/utility/common/user-roles.enum';
import { CurrentUser } from 'src/utility/decorators/current-user.decorator';
import { CreateStoreDto } from './dto/create-store.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { UpdateStoreDto } from './dto/update-store.dto';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get('/admin-filter-stores')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  async adminFilterStores(@Query() query: any) {
    return await this.storesService.adminFilterStores(query);
  }

  @Post('/create')
  async create(@Body() createStoreDto: CreateStoreDto) {
    return await this.storesService.create(createStoreDto);
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Put('/update')
  async update(
    @Body() updateStoreDto: UpdateStoreDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.storesService.update(updateStoreDto, currentUser);
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  @Get('/')
  async getAllStores() {
    return await this.storesService.getAllStores();
  }

  @Get('/:id')
  async findStore(@Param('id') id: string) {
    return await this.storesService.findStore(+id);
  }
}
