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

    return await this.auctionRepository.save(auction);
  }

  async findOne(id: number) {
    const auction = await this.auctionRepository.findOne({
      where: {
        id,
      },
      relations: {
        candidates: {
          store: true,
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

    Object.assign(bidder, updateBidderDto);
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
}
