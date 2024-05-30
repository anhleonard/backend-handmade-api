import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewEntity } from './entities/review.entity';
import { Repository } from 'typeorm';
import { ProductsService } from 'src/products/products.service';
import { ProductEntity } from 'src/products/entities/product.entity';
import { CreateReportReviewDto } from './dto/create-report-review.dto';
import { OrderEntity } from 'src/orders/entities/order.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewRepository: Repository<ReviewEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    private readonly productService: ProductsService,
  ) {}
  async create(createReviewDto: CreateReviewDto, currentUser: UserEntity) {
    const order = await this.orderRepository.findOne({
      where: {
        id: createReviewDto.orderId,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    const product = await this.productRepository.findOne({
      where: {
        id: createReviewDto.productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    let review = await this.findCreatedReview(
      currentUser.id,
      createReviewDto.productId,
      createReviewDto.orderId,
    );

    if (!review) {
      review = this.reviewRepository.create(createReviewDto);
      review.user = currentUser;
      review.product = product;
      review.order = order;
    } else {
      (review.comment = createReviewDto.comment),
        (review.ratings = createReviewDto.ratings);
    }

    const createdReview = await this.reviewRepository.save(review);

    const reviews = await this.reviewRepository.find({
      where: {
        product: {
          id: createReviewDto.productId,
        },
      },
      relations: {
        product: true,
      },
    });

    const totalRatings = reviews.reduce(
      (acc, review) => acc + review.ratings,
      0,
    );

    const averageRating = totalRatings / reviews.length;

    product.averageRating = averageRating;

    await this.productRepository.save(product);

    return createdReview;
  }

  findAll() {
    return `This action returns all reviews`;
  }

  async findAllByProduct(id: number): Promise<ReviewEntity[]> {
    const product = await this.productService.findOne(id);
    return await this.reviewRepository.find({
      where: { product: { id } },
      relations: {
        user: true,
      },
    });
  }
  async findOne(id: number): Promise<ReviewEntity> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: {
        user: true,
        product: {
          category: true,
        },
      },
    });
    if (!review) throw new NotFoundException('Review not found.');
    return review;
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  async remove(id: number) {
    const review = await this.findOne(id);

    if (!review) throw new NotFoundException('Review not found.');

    return this.reviewRepository.remove(review);
  }

  async reportReview(
    reportedReview: CreateReportReviewDto,
    currentUser: UserEntity,
  ) {
    const review = await this.reviewRepository.findOne({
      where: {
        id: reportedReview.reviewId,
        product: {
          store: {
            owner: {
              id: currentUser.id,
            },
          },
        },
      },
      relations: {
        user: true,
        product: {
          store: {
            owner: true,
          },
        },
      },
    });

    if (!review) throw new NotFoundException('Review not found.');

    review.isReported = true;

    review.reportedReason = reportedReview.reportedReason;

    return await this.reviewRepository.save(review);
  }

  async removeReportedReview(reviewId: number) {
    try {
      const review = await this.reviewRepository.findOne({
        where: {
          id: reviewId,
          isReported: true,
        },
      });

      if (!review) {
        throw new NotFoundException('Review not found to un-reported');
      }

      review.isReported = false;
      review.reportedReason = null;

      return await this.reviewRepository.save(review);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findCreatedReview(userId: number, productId: number, orderId: number) {
    return await this.reviewRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        product: {
          id: productId,
        },
        order: {
          id: orderId,
        },
      },
      relations: {
        user: true,
        product: {
          category: true,
        },
        order: true,
      },
    });
  }

  async getCreatedReview(query: any) {
    const review = await this.reviewRepository.findOne({
      where: {
        product: {
          id: query?.productId,
        },
        order: {
          id: query?.orderId,
        },
      },
      relations: {
        product: {
          category: true,
        },
        order: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    return review;
  }
}
