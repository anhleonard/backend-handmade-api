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
  Req,
  UploadedFile,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthenticationGuard } from 'src/utility/guards/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guards/authorization.guard';
import { Roles } from 'src/utility/common/user-roles.enum';
import { CurrentUser } from 'src/utility/decorators/current-user.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import { ProductEntity } from './entities/product.entity';
import { SerializeIncludes } from 'src/utility/interceptors/serialize.interceptor';
import { ProductsDto } from './dto/products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { storageConfig } from 'helpers/config';
import { UpdateApproveProductDto } from './dto/update-approve-product.dto';
import { UpdateFavouriteProducts } from './dto/update-favourite-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ADMIN
  @Get('/admin-filter-products')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  async filterAdminProducts(@Query() query: any) {
    return await this.productsService.filterAdminProducts(query);
  }

  @Get('/filter-store-products/:storeId')
  async getStoreProducts(
    @Param('storeId') storeId: string,
    @Query() query: any,
  ) {
    return await this.productsService.getStoreProducts(+storeId, query);
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Post('/create')
  async create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.productsService.create(createProductDto, currentUser);
  }

  @SerializeIncludes(ProductsDto)
  @Get()
  async findAll(@Query() query: any): Promise<ProductsDto> {
    return await this.productsService.findAll(query);
  }

  @Get('/filter')
  async filterProducts(@Query() query: any) {
    return await this.productsService.filterSellingProducts(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(+id);
  }

  // ----------------- start: FIND PRODUCTS BY SELLER --------------------- //

  //1. tất cả
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Post('/seller-products')
  async getProductsBySeller(
    @Query() query: any,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.productsService.getProductsBySeller(query, currentUser);
  }

  //2. chờ duyệt (pending)
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Post('/pending-products')
  async getPendingProducts(@CurrentUser() currentUser: UserEntity) {
    return await this.productsService.getPendingProducts(currentUser);
  }

  //3. đang bán (selling)
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Post('/selling-products')
  async getSellingProducts(@CurrentUser() currentUser: UserEntity) {
    return await this.productsService.getSellingProducts(currentUser);
  }

  //3. bị cấm (violate)
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Post('/violate-products')
  async getViolateProducts(@CurrentUser() currentUser: UserEntity) {
    return await this.productsService.getViolateProducts(currentUser);
  }

  //4. hết hàng (no items)
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Post('/empty-products')
  async getEmptyProducts(@CurrentUser() currentUser: UserEntity) {
    return await this.productsService.getEmptyProducts(currentUser);
  }

  //4. đã tắt (off items)
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Post('/off-products')
  async getOffProducts(@CurrentUser() currentUser: UserEntity) {
    return await this.productsService.getOffProducts(currentUser);
  }
  // -----------------end: FIND PRODUCTS BY SELLER --------------------- //

  //bao gồm update category cho product
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
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

  //duyệt product by admin
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  @Put('/update-approve/:id')
  async updateApprove(
    @Param('id') id: string,
    @Body() data: UpdateApproveProductDto,
  ) {
    return await this.productsService.updateApprove(+id, data);
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Delete('/delete/:id')
  async remove(@Param('id') id: string) {
    return await this.productsService.remove(+id);
  }

  // favourite products
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.USER]))
  @Put('/update-favourite-products')
  async updateFavouriteProducts(
    @Body() updateFavouriteProducts: UpdateFavouriteProducts,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.productsService.updateFavouriteProducts(
      updateFavouriteProducts,
      currentUser,
    );
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.USER]))
  @Post('/favourite-products')
  async getFavouriteProducts(@CurrentUser() currentUser: UserEntity) {
    return await this.productsService.getFavouriteProducts(currentUser);
  }

  @Post('/upload-image')
  @UseInterceptors(
    FileInterceptor('image', { storage: storageConfig('image') }),
  )
  async uploadImage(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return file.destination + '/' + file.filename;
  }

  @Post('/uploads')
  @UseInterceptors(
    FilesInterceptor('files', null, { storage: storageConfig('image') }),
  )
  async uploadImages(
    @Req() req: Request,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    let customFiles = [];
    for (let file of files) {
      if (file) {
        customFiles.push(file.destination + '/' + file.filename);
      }
    }

    return customFiles;
  }

  @Get('/product-images')
  async getProductImages(@Param('productId') productId: string) {
    return await this.productsService.getProductImages(+productId);
  }

  @Get('/uploads/image/:path')
  seeUploadedFile(@Param('path') path: string, @Res() res) {
    return res.sendFile(path, { root: './uploads/image' });
  }

  // ----------------- ADMIN ------------------
}
