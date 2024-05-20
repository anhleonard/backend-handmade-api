import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuctionEntity } from './entities/auction.entity';
import { Repository } from 'typeorm';
import { CreateAuctionDto } from './dto/auction/create-auction.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { ShippingEntity } from 'src/shippings/entities/shipping.entity';
import { UpdateAuctionDto } from './dto/auction/update-auction.dto';
import { Roles } from 'src/utility/common/user-roles.enum';
import { BidderEntity } from './entities/bidder.entity';
import { CreateBidderDto } from './dto/bidder/create-bidder.dto';
import { UpdateBidderDto } from './dto/bidder/update-bidder.dto';
import { AuctionStatus } from './enum/auction.enum';
import { GetByAuctionStatus } from './dto/auction/get-auction-status.dto';
import { UpdateAuctionStatusDto } from './dto/auction/update-status-auction.dto';

@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(AuctionEntity)
    private readonly auctionRepository: Repository<AuctionEntity>,
    @InjectRepository(ShippingEntity)
    private readonly shippingRepository: Repository<ShippingEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(BidderEntity)
    private readonly bidderRepository: Repository<BidderEntity>,
  ) {}

  /// --------------- auction ------------------- ///

  async create(createAuctionDto: CreateAuctionDto, currentUser: UserEntity) {
    const shipping = await this.shippingRepository.findOne({
      where: {
        id: createAuctionDto.shippingId,
        user: {
          id: currentUser.id,
        },
      },
      relations: {
        user: true,
      },
    });

    if (!shipping) {
      throw new NotFoundException('Shipping address not found');
    }

    const auction = this.auctionRepository.create(createAuctionDto);
    auction.owner = currentUser;
    auction.shipping = shipping;

    return await this.auctionRepository.save(auction);
  }

  async update(
    id: number,
    updateAuctionDto: UpdateAuctionDto,
    currentUser: UserEntity,
  ) {
    const auction = await this.auctionRepository.findOne({
      where: {
        id,
      },
    });

    if (!auction) {
      throw new NotFoundException('Auction not found.');
    }

    if (currentUser.role === Roles.ADMIN) {
      if (
        updateAuctionDto.additionalComment === undefined &&
        updateAuctionDto.isAccepted === undefined
      ) {
        throw new BadRequestException(
          'Role ADMIN: require additionalComment & isAccepted fields',
        );
      } else if (
        updateAuctionDto.additionalComment === undefined &&
        updateAuctionDto.isAccepted === false
      ) {
        throw new BadRequestException('Role ADMIN: additional comment pls');
      } else if (
        updateAuctionDto.additionalComment !== undefined &&
        updateAuctionDto.isAccepted === true
      ) {
        throw new BadRequestException(
          'Role ADMIN: remove additional comment pls',
        );
      }
    }

    if (updateAuctionDto.isAccepted === true) {
      auction.additionalComment = null;
      auction.status = AuctionStatus.AUCTIONING;
    }

    if (updateAuctionDto.maxAmount !== undefined) {
      auction.deposit = updateAuctionDto.maxAmount * 0.3;
    }

    if (currentUser.role === Roles.USER) {
      if (
        updateAuctionDto.additionalComment !== undefined ||
        updateAuctionDto.isAccepted !== undefined
      ) {
        throw new BadRequestException(
          'additionalComment & isAccepted fields must be updated by ADMIN',
        );
      }
    }

    Object.assign(auction, updateAuctionDto);

    auction.updatedAt = new Date();

    return await this.auctionRepository.save(auction);
  }

  async updateStatus(id: number, updateStatus: UpdateAuctionStatusDto) {
    const auction = await this.auctionRepository.findOne({
      where: {
        id,
      },
    });

    if (!auction) {
      throw new NotFoundException('Auction not found.');
    }

    Object.assign(auction, updateStatus);

    return this.auctionRepository.save(auction);
  }

  async filterAuctions(query: any) {
    const builder = this.auctionRepository.createQueryBuilder('auctions');

    builder
      .leftJoinAndSelect('auctions.candidates', 'candidates')
      .leftJoinAndSelect('candidates.store', 'store')
      .leftJoinAndSelect('store.owner', 'owner')
      .where('auctions.status = :status', {
        status: AuctionStatus.AUCTIONING,
      });

    if (query?.title) {
      const name = query.title.toLowerCase();
      builder.andWhere(
        'LOWER(auctions.name) LIKE :title OR LOWER(auctions.description) LIKE :title',
        { title: `%${name}%` },
      );
    }

    if (query?.minPrice && query?.maxPrice) {
      builder.andWhere(
        'CAST(auctions.maxAmount AS INT) BETWEEN :minPrice AND :maxPrice',
        { minPrice: query.minPrice, maxPrice: query.maxPrice },
      );
    } else if (query?.minPrice) {
      builder.andWhere('CAST(auctions.maxAmount AS INT) >= :minPrice', {
        minPrice: query.minPrice,
      });
    } else if (query?.maxPrice) {
      builder.andWhere('CAST(auctions.maxAmount AS INT) <= :maxPrice', {
        maxPrice: query.maxPrice,
      });
    }

    // Thêm điều kiện lọc theo số ngày
    if (query?.minDay && query?.maxDay) {
      builder.andWhere('auctions.maxDays BETWEEN :minDay AND :maxDay', {
        minDay: query.minDay,
        maxDay: query.maxDay,
      });
    } else if (query?.minDay) {
      builder.andWhere('auctions.maxDays >= :minDay', {
        minDay: query.minDay,
      });
    } else if (query?.maxDay) {
      builder.andWhere('auctions.maxDays <= :maxDay', {
        maxDay: query.maxDay,
      });

      const ex = builder.getQueryAndParameters();
      console.log({ ex });
    }

    return await builder.getMany();
  }

  async findOne(id: number) {
    const auction = await this.auctionRepository.findOne({
      where: {
        id,
      },
      relations: {
        candidates: {
          store: {
            owner: true,
          },
        },
        progresses: true,
      },
    });

    if (!auction) {
      throw new NotFoundException('Auction not found.');
    }

    return auction;
  }

  /// --------------- bidder ------------------- ///
  async createBidder(
    createBidderDto: CreateBidderDto,
    currentUser: UserEntity,
  ) {
    const auction = await this.auctionRepository.findOne({
      where: {
        id: createBidderDto.auctionId,
      },
    });

    if (!auction) {
      throw new NotFoundException('Auction not found.');
    }

    const seller = await this.userRepository.findOne({
      where: {
        id: currentUser.id,
      },
      relations: {
        store: true,
      },
    });

    if (!seller?.store) {
      throw new NotFoundException('Not found store');
    }

    const bidder = this.bidderRepository.create(createBidderDto);
    bidder.store = seller.store;
    bidder.auction = auction;

    return await this.bidderRepository.save(bidder);
  }

  async updateBidder(
    id: number,
    updateBidderDto: UpdateBidderDto,
    currentUser: UserEntity,
  ) {
    const bidder = await this.bidderRepository.findOne({
      where: {
        id,
      },
      relations: {
        auction: true,
      },
    });

    if (
      bidder?.auction?.status &&
      bidder?.auction?.status !== AuctionStatus.AUCTIONING
    ) {
      throw new BadRequestException('This project has selected candidates!');
    }

    if (!bidder) {
      throw new NotFoundException('Bidder not found.');
    }

    if (
      currentUser.role === Roles.USER &&
      updateBidderDto.isSelected === undefined
    ) {
      throw new BadRequestException('Role USER: must update isSelected field');
    }

    if (
      currentUser.role === Roles.SELLER &&
      updateBidderDto.isSelected !== undefined
    ) {
      throw new BadRequestException(
        'Role SELLER: isSelected must be updated by user',
      );
    }

    const auction = await this.auctionRepository.findOne({
      where: {
        id: bidder.auction.id,
      },
    });

    auction.status = AuctionStatus.PROGRESS;

    Object.assign(bidder, updateBidderDto);

    const updatedAuction = await this.auctionRepository.save(auction);
    bidder.auction = updatedAuction;
    return await this.bidderRepository.save(bidder);
  }

  async findOneBidder(id: number) {
    const bidder = await this.bidderRepository.findOne({
      where: {
        id,
      },
      relations: {
        auction: true,
      },
    });

    if (!bidder) {
      throw new NotFoundException('Bidder not found.');
    }

    return bidder;
  }

  async findAllClientAuctions(
    auctionStatus: GetByAuctionStatus,
    currentUser: UserEntity,
  ) {
    const whereCondition: any = {
      owner: {
        id: currentUser.id,
      },
    };

    if (auctionStatus?.status) {
      whereCondition.status = auctionStatus.status;
    }

    const auctions = await this.auctionRepository.find({
      where: whereCondition,
      relations: {
        owner: true,
        candidates: true,
      },
    });

    if (!auctions) {
      throw new NotFoundException('Auctions not found.');
    }

    return auctions;
  }
}
