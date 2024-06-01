import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserEntity } from 'src/users/entities/user.entity';
import { Roles } from 'src/utility/common/user-roles.enum';
import { CurrentUser } from 'src/utility/decorators/current-user.decorator';
import { AuthenticationGuard } from 'src/utility/guards/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guards/authorization.guard';
import { CreateCollectionDto } from './dto/create-collections.dto';
import { StoreCollectionsService } from './store_collections.service';
import { UpdateCollectionDto } from './dto/update-collections.dto';

@Controller('collections')
export class StoreCollectionsController {
  constructor(private readonly collectionsService: StoreCollectionsService) {}

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Post('/create')
  async create(
    @Body() createCollectionDto: CreateCollectionDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.collectionsService.create(
      createCollectionDto,
      currentUser,
    );
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Put('/update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.collectionsService.update(
      +id,
      updateCollectionDto,
      currentUser,
    );
  }

  @Get('/:collectId')
  async findOne(@Param('collectId') collectId: string) {
    return await this.collectionsService.findOne(+collectId);
  }

  @Get('/seller/:sellerId')
  async getStoreCollections(
    @Param('sellerId') sellerId: string,
    @Query() query: any,
  ) {
    return await this.collectionsService.getStoreCollections(+sellerId, query);
  }

  @Get('/store/:storeId')
  async getAllStoreCollections(@Param('storeId') storeId: string) {
    return await this.collectionsService.getAllStoreCollections(+storeId);
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Delete('/delete/')
  async removeProductInCollection(
    @Query('collectionId') collectionId: string,
    @Query('productId') productId: string,
  ) {
    return await this.collectionsService.removeProductInCollection(
      +collectionId,
      +productId,
    );
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Delete('/delete-collection')
  async removeCollection(@Query('collectionId') collectionId: string) {
    return await this.collectionsService.removeCollection(+collectionId);
  }
}
