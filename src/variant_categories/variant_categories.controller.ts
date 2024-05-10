import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { VariantCategoriesService } from './variant_categories.service';
import { Roles } from 'src/utility/common/user-roles.enum';
import { AuthenticationGuard } from 'src/utility/guards/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guards/authorization.guard';
import { CreateVariantCategoryDto } from './dto/create-variant-category.dto';
import { CurrentUser } from 'src/utility/decorators/current-user.decorator';
import { UserEntity } from 'src/users/entities/user.entity';

@Controller('variant-categories')
export class VariantCategoriesController {
  constructor(
    private readonly variantCategoriesService: VariantCategoriesService,
  ) {}

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Post('/create')
  async create(
    @Body() createVariantCategoryDto: CreateVariantCategoryDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.variantCategoriesService.create(
      createVariantCategoryDto,
      currentUser,
    );
  }

  // lấy ra 1 single variant category
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Post('/seller-variant-categories')
  async getListVariantCategories(@CurrentUser() currentUser: UserEntity) {
    return await this.variantCategoriesService.getListVariantCategories(
      currentUser,
    );
  }

  // lấy ra 1 single variant category
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Get('/:id')
  async getSingleVariantCategory(@Param('id') id: string) {
    return await this.variantCategoriesService.getSingleVariantCategory(+id);
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Delete('/delete/:id')
  async deleteVariantCategory(@Param('id') id: string) {
    return await this.variantCategoriesService.deleteVariantCategory(+id);
  }
}
