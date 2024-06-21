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
import { CreateProgressDto } from './dto/progress/create-progress.dto';
import { ProgressEntity } from './entities/progress.entity';
import { UpdateProgressDto } from './dto/progress/update-progress.dto';
import { CreatePaidAuctionDto } from './dto/auction/create-paid-auction.dto';
import { PaidAuctionEntity } from './entities/paid-auction.entity';
import { UpdatePaidAuctionDto } from './dto/auction/update-paid-auction.dto';
import { StoreEntity } from 'src/stores/entities/stores.entity';
import { CreateAdditionDto } from './dto/addition/create-addition.dto';
import { AdditionEntity } from './entities/addition.entity';
import { UpdateAdditionDto } from './dto/addition/update-addition.dto';

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
    @InjectRepository(ProgressEntity)
    private readonly progressRepository: Repository<ProgressEntity>,
    @InjectRepository(PaidAuctionEntity)
    private readonly paidRepository: Repository<PaidAuctionEntity>,
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
    @InjectRepository(AdditionEntity)
    private readonly additionRepository: Repository<AdditionEntity>,
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

    const createdAuction = await this.auctionRepository.save(auction);

    //nếu có store được client select
    if (createAuctionDto?.selectedStoreId) {
      const store = await this.storeRepository.findOne({
        where: {
          id: createAuctionDto.selectedStoreId,
        },
      });

      if (!store) {
        throw new NotFoundException('Store not found');
      }

      const newBidder = this.bidderRepository.create();
      newBidder.acceptedAt = new Date();
      newBidder.bidderMoney = createAuctionDto.maxAmount;
      newBidder.estimatedDay = createAuctionDto.maxDays;
      newBidder.isSelected = true;
      newBidder.selfIntroduce = store?.description;
      newBidder.store = store;
      newBidder.auction = createdAuction;

      await this.bidderRepository.save(newBidder);
    }

    return createdAuction;
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

    if (updateAuctionDto.isAccepted === true && !updateAuctionDto.status) {
      auction.additionalComment = null;
      auction.status = AuctionStatus.AUCTIONING;
    }

    if (
      updateAuctionDto.isAccepted === true &&
      updateAuctionDto.status === AuctionStatus.SENT_SELLER
    ) {
      auction.additionalComment = null;
      auction.status = AuctionStatus.SENT_SELLER;
    }

    if (
      updateAuctionDto.isAccepted === false &&
      updateAuctionDto?.additionalComment
    ) {
      auction.status = AuctionStatus.CANCELED;
      auction.canceledBy = currentUser;
    }

    if (
      updateAuctionDto?.status &&
      updateAuctionDto?.additionalComment &&
      updateAuctionDto?.status === AuctionStatus.CANCELED
    ) {
      auction.canceledBy = currentUser;
      auction.additionalComment = updateAuctionDto.additionalComment;
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
        '(LOWER(auctions.name) LIKE :title OR LOWER(auctions.description) LIKE :title)',
        { title: `%${name}%` },
      );
    }

    if (query?.minPrice && query?.maxPrice) {
      builder.andWhere(
        '(CAST(auctions.maxAmount AS INT) BETWEEN :minPrice AND :maxPrice)',
        { minPrice: query.minPrice, maxPrice: query.maxPrice },
      );
    } else if (query?.minPrice) {
      builder.andWhere('(CAST(auctions.maxAmount AS INT) >= :minPrice)', {
        minPrice: query.minPrice,
      });
    } else if (query?.maxPrice) {
      builder.andWhere('(CAST(auctions.maxAmount AS INT) <= :maxPrice)', {
        maxPrice: query.maxPrice,
      });
    }

    // Thêm điều kiện lọc theo số ngày
    if (query?.minDay && query?.maxDay) {
      builder.andWhere('(auctions.maxDays BETWEEN :minDay AND :maxDay)', {
        minDay: query.minDay,
        maxDay: query.maxDay,
      });
    } else if (query?.minDay) {
      builder.andWhere('(auctions.maxDays >= :minDay)', {
        minDay: query.minDay,
      });
    } else if (query?.maxDay) {
      builder.andWhere('(auctions.maxDays <= :maxDay)', {
        maxDay: query.maxDay,
      });
    }

    const now = Date.now();

    if (query?.overDate === 'false') {
      builder.andWhere('EXTRACT(EPOCH FROM auctions.closedDate) > :now', {
        now: now / 1000,
      });
    } else if (query?.overDate === 'true') {
      builder.andWhere('EXTRACT(EPOCH FROM auctions.closedDate) <= :now', {
        now: now / 1000,
      });
    }

    const auctions = await builder.getMany();

    return auctions;
  }

  async filterTopAuctions() {
    const builder = this.auctionRepository.createQueryBuilder('auctions');

    builder
      .leftJoin('auctions.candidates', 'candidates')
      .addSelect('auctions.*, COUNT(candidates.id) AS candidateCount') // Đếm số lượng candidates cho mỗi auction
      .groupBy('auctions.id') // Nhóm theo ID của auction
      .orderBy('candidateCount', 'DESC') // Sắp xếp theo số lượng candidates giảm dần
      .where('auctions.status = :status', {
        status: AuctionStatus.AUCTIONING,
      });

    const page = 1;
    let perPage = 5;
    builder.offset((page - 1) * perPage).limit(perPage);

    // Lấy auction chưa quá hạn closedDate
    const now = Date.now();
    builder.andWhere('auctions.closedDate > :now', {
      now: new Date(now),
    });

    const auctions = await builder.getRawMany(); // Sử dụng getRawMany để lấy kết quả dưới dạng mảng các đối tượng

    return auctions;
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
        progresses: {
          user: true,
        },
        shipping: true,
        owner: true,
        canceledBy: true,
        paids: true,
        addition: true,
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
    bidder.acceptedAt = new Date(); //cập nhật ngày accept từ phía khách

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
    const builder = this.auctionRepository
      .createQueryBuilder('auction')
      .leftJoinAndSelect('auction.owner', 'owner')
      .where('owner.id = :ownerId', { ownerId: currentUser.id });

    if (auctionStatus?.status !== undefined) {
      let statusValue: string | null;

      if (auctionStatus.status === null) {
        statusValue = null;
      } else {
        statusValue = auctionStatus.status as string; // Explicitly cast to string
      }

      if (statusValue === null) {
        builder.andWhere('auction.status IS NULL');
      } else {
        builder.andWhere('auction.status = :status', {
          status: statusValue,
        });
      }
    }

    if (
      auctionStatus.status === null ||
      auctionStatus.status === AuctionStatus.AUCTIONING
    ) {
      const now = Date.now();

      if (auctionStatus.overDate === false) {
        builder.andWhere('EXTRACT(EPOCH FROM auction.closedDate) > :now', {
          now: now / 1000,
        });
      } else if (auctionStatus.overDate === true) {
        builder.andWhere('EXTRACT(EPOCH FROM auction.closedDate) <= :now', {
          now: now / 1000,
        });
      }
    }

    const auctions = await builder.getMany();

    if (!auctions) {
      throw new NotFoundException('Auctions not found.');
    }

    let customAuctions: AuctionEntity[] = [];

    for (let auction of auctions) {
      const foundAuction = await this.auctionRepository.findOne({
        where: {
          id: auction.id,
        },
        relations: {
          owner: true,
          candidates: true,
          progresses: true,
          canceledBy: true,
        },
      });

      customAuctions.push(foundAuction);
    }

    return customAuctions;
  }

  async findAllSellerAuctions(
    auctionStatus: GetByAuctionStatus,
    currentUser: UserEntity,
  ) {
    const whereCondition: any = {
      candidates: {
        store: {
          owner: {
            id: currentUser.id,
          },
        },
        isSelected: true,
      },
    };

    if (auctionStatus?.status) {
      whereCondition.status = auctionStatus.status;
    }

    if (auctionStatus?.status === AuctionStatus.PROGRESS) {
      whereCondition.isPaymentFull = true;
    }

    const auctions = await this.auctionRepository.find({
      where: whereCondition,
      relations: {
        candidates: {
          store: {
            owner: true,
          },
        },
        canceledBy: true,
        paids: true,
        progresses: true,
      },
    });

    if (!auctions) {
      throw new NotFoundException('Auctions not found.');
    }

    return auctions;
  }

  /// --------------- PROGRESS ------------------- ///
  async createProgress(
    createProgressDto: CreateProgressDto,
    currentUser: UserEntity,
  ) {
    const auction = await this.auctionRepository.findOne({
      where: {
        id: createProgressDto.auctionId,
      },
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    const createProgress = this.progressRepository.create(createProgressDto);

    createProgress.auction = auction;
    createProgress.user = currentUser;

    return await this.progressRepository.save(createProgress);
  }

  async updateProgress(
    id: number,
    updateProgressDto: UpdateProgressDto,
    currentUser: UserEntity,
  ) {
    const progress = await this.progressRepository.findOne({
      where: {
        id,
        user: {
          id: currentUser.id,
        },
      },
      relations: {
        user: true,
      },
    });

    if (!progress) {
      throw new NotFoundException('Progress not found');
    }

    Object.assign(progress, updateProgressDto);

    progress.updatedAt = new Date();

    return await this.progressRepository.save(progress);
  }

  async adminFilterAuctions(query: any) {
    const builder = this.auctionRepository.createQueryBuilder('auctions');

    //filter theo status
    if (query?.status !== undefined) {
      const statusValue = query.status === 'null' ? null : query.status;

      if (statusValue === null) {
        builder.andWhere('(auctions.status IS NULL)');
      } else {
        builder.andWhere('(auctions.status = :status)', {
          status: statusValue,
        });
      }
    }

    //filter theo auction name
    if (query?.auctionName) {
      const name = query.auctionName.toLowerCase();
      builder.andWhere(
        '(LOWER(auctions.name) LIKE :auctionName OR LOWER(auctions.description) LIKE :auctionName)',
        { auctionName: `%${name}%` },
      );
    }

    if (query?.readyToLaunch) {
      builder.andWhere('(auctions.readyToLaunch = :readyToLaunch)', {
        readyToLaunch: query?.readyToLaunch,
      });
    }

    if (
      query?.status === 'null' ||
      query?.status === AuctionStatus.AUCTIONING
    ) {
      const now = Date.now();
      if (query?.overDate === 'false') {
        builder.andWhere('EXTRACT(EPOCH FROM auctions.closedDate) > :now', {
          now: now / 1000,
        });
      } else if (query?.overDate === 'true') {
        builder.andWhere('EXTRACT(EPOCH FROM auctions.closedDate) <= :now', {
          now: now / 1000,
        });
      }
    }

    const page: number = parseInt(query?.page as any) || 1;
    let perPage = 25;
    if (query?.limit) {
      perPage = query?.limit;
    }
    const total = await builder.getCount();

    builder.offset((page - 1) * perPage).limit(perPage);

    const auctions = await builder.getMany();

    const customAuctions: AuctionEntity[] = [];

    for (let auction of auctions) {
      const foundAuction = await this.auctionRepository.findOne({
        where: {
          id: auction.id,
        },
        relations: {
          owner: true,
          candidates: {
            store: true,
          },
          progresses: true,
          canceledBy: true,
        },
      });

      customAuctions.push(foundAuction);
    }

    return {
      data: customAuctions,
      total,
      page,
      last_page: Math.ceil(total / perPage),
    };
  }

  async createPaidAuction(createPaidAuction: CreatePaidAuctionDto) {
    const auction = await this.auctionRepository.findOne({
      where: {
        id: createPaidAuction.auctionId,
      },
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    const paid = this.paidRepository.create(createPaidAuction);

    paid.auction = auction;

    return await this.paidRepository.save(paid);
  }

  async updatePaidAuction(updatePaidAuction: UpdatePaidAuctionDto) {
    const paid = await this.paidRepository.findOne({
      where: {
        type: updatePaidAuction?.type,
        auction: {
          id: updatePaidAuction?.auctionId,
        },
      },
      relations: {
        auction: true,
      },
    });

    if (!paid) {
      throw new NotFoundException('Paid auction not found!');
    }

    paid.isRefund = true;

    return await this.paidRepository.save(paid);
  }

  async delete(id: number) {
    const auction = await this.auctionRepository.findOne({
      where: { id },
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    return await this.auctionRepository.remove(auction);
  }

  /// --------------- additional days ------------------- ///
  async createAddition(
    createAdditionDto: CreateAdditionDto,
    currentUser: UserEntity,
  ) {
    const auction = await this.auctionRepository.findOne({
      where: {
        id: createAdditionDto.auctionId,
      },
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    const createAddition = this.additionRepository.create(createAdditionDto);

    createAddition.auction = auction;
    createAddition.user = currentUser;

    return await this.additionRepository.save(createAddition);
  }

  async updateAddition(id: number, updateAdditionDto: UpdateAdditionDto) {
    const addition = await this.additionRepository.findOne({
      where: { id },
    });

    if (!addition) {
      throw new NotFoundException('Addition not found');
    }

    if (updateAdditionDto?.isAccepted === true) {
      const bidder = await this.bidderRepository.findOne({
        where: {
          auction: {
            id: updateAdditionDto?.auctionId,
          },
          isSelected: true,
        },
        relations: {
          auction: true,
        },
      });

      if (!bidder) {
        throw new NotFoundException('Selected bidder not found');
      }

      bidder.estimatedDay = bidder.estimatedDay + addition.days;

      await this.bidderRepository.save(bidder); //extend estimated days for bidder
    }

    Object.assign(addition, updateAdditionDto); //update addition ở đây

    addition.updatedAt = new Date();

    return await this.additionRepository.save(addition);
  }

  async deletePaidAuction(id: number) {
    const paid = await this.paidRepository.findOne({
      where: { id },
    });

    if (!paid) {
      throw new NotFoundException('Paid not found');
    }

    return await this.paidRepository.remove(paid);
  }

  async randomAuctions() {
    return this.auctionRepository
      .createQueryBuilder('auction')
      .select([
        'auction.id',
        'auction.name',
        'auction.maxAmount',
        'auction.status',
      ])
      .where('auction.status = :status', { status: 'AUCTIONING' })
      .orderBy('RANDOM()')
      .limit(5)
      .getMany();
  }
}
