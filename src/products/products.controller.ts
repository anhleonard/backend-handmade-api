import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  Put,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthenticationGuard } from 'src/utility/guards/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guards/authorization.guard';
import { Roles } from 'src/utility/common/user-roles.enum';
import { CurrentUser } from 'src/utility/decorators/current-user.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import { ProductEntity } from './entities/product.entity';
import {
  SerializeIncludes,
  SerializeInterceptor,
} from 'src/utility/interceptors/serialize.interceptor';
import { ProductsDto } from './dto/products.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Post('/create')
  async create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<ProductEntity> {
    return await this.productsService.create(createProductDto, currentUser);
  }

  @SerializeIncludes(ProductsDto)
  @Get()
  async findAll(@Query() query: any): Promise<ProductsDto> {
    return await this.productsService.findAll(query);
  }

  // @Get('all')
  // async getAllProducts(@Query() query: any): Promise<ProductsDto> {
  //   return await this.productsService.getAllProducts(query);
  // }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(+id);
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  //bao gồm update category cho product
  @Put('/update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<ProductEntity> {
    return await this.productsService.update(
      +id,
      updateProductDto,
      currentUser,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.productsService.remove(+id);
  }

  // favourite products
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.USER]))
  @Put('/update-favourite-products')
  async updateFavouriteProducts(
    @Body('productId') productId: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.productsService.updateFavouriteProducts(
      +productId,
      currentUser,
    );
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.USER]))
  @Post('/favourite-products')
  async getFavouriteProducts(@Body('userId') userId: string) {
    return await this.productsService.getFavouriteProducts(+userId);
  }
}
