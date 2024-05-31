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
import { VariantsService } from './variants.service';
import { CreateVariantDto } from './dto/create-variants.dto';
import { AuthenticationGuard } from 'src/utility/guards/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guards/authorization.guard';
import { Roles } from 'src/utility/common/user-roles.enum';
import { CurrentUser } from 'src/utility/decorators/current-user.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Controller('variants')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Post('/create')
  async create(
    @Body() createVariantDto: CreateVariantDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.variantsService.create(createVariantDto, currentUser);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.variantsService.findOne(+id);
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Put('/update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateVariantDto: UpdateVariantDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.variantsService.update(
      +id,
      updateVariantDto,
      currentUser,
    );
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Put('/update-simple-variant/:id')
  async updateSimpleVariant(
    @Param('id') id: string,
    @Body() updateVariantDto: UpdateVariantDto,
  ) {
    return await this.variantsService.updateSimpleVariant(
      +id,
      updateVariantDto,
    );
  }

  @Delete('/delete/:id')
  async delete(@Param('id') id: string) {
    return await this.variantsService.delete(+id);
  }
}
