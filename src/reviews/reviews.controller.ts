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
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AuthenticationGuard } from 'src/utility/guards/authentication.guard';
import { CurrentUser } from 'src/utility/decorators/current-user.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import { ReviewEntity } from './entities/review.entity';
import { Roles } from 'src/utility/common/user-roles.enum';
import { AuthorizeGuard } from 'src/utility/guards/authorization.guard';
import { CreateReportReviewDto } from './dto/create-report-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  //tạo review
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.USER]))
  @Post('/create')
  async create(
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<ReviewEntity> {
    return await this.reviewsService.create(createReviewDto, currentUser);
  }

  //get all reviews in repository
  @Get('/all')
  findAll() {
    return this.reviewsService.findAll();
  }

  //get all reviews by productId
  @Get()
  async findAllByProduct(@Body('productId') productId: number) {
    return await this.reviewsService.findAllByProduct(+productId);
  }

  //get review by its id
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ReviewEntity> {
    return await this.reviewsService.findOne(+id);
  }

  //hàm create đã update rùi nha
  @Put('/update/:id')
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(+id, updateReviewDto);
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.USER]))
  @Delete('/delete/:id')
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(+id);
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Post('/report')
  async reportReview(
    @Body() reportedReview: CreateReportReviewDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.reviewsService.reportReview(reportedReview, currentUser);
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  @Put('/remove-reported-review/:id')
  async removeReportedReview(@Param('id') id: string) {
    return this.reviewsService.removeReportedReview(+id);
  }
}
