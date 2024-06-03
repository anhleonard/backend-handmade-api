import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShippingEntity } from './entities/shipping.entity';
import { Repository } from 'typeorm';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { UpdateShippingDto } from './dto/update-shipping.dto';

@Injectable()
export class ShippingsService {
  constructor(
    @InjectRepository(ShippingEntity)
    private readonly shippingRepository: Repository<ShippingEntity>,
  ) {}

  async create(
    createShippingDto: CreateShippingDto,
    currentUser: UserEntity,
  ): Promise<ShippingEntity> {
    if (createShippingDto.isDefaultAddress) {
      await this.removeDefaultAddress(currentUser);
    }

    let shipping = this.shippingRepository.create(createShippingDto);
    shipping.user = currentUser;
    shipping = await this.shippingRepository.save(shipping);
    return shipping;
  }

  async findAllByUser(userId: number): Promise<ShippingEntity[]> {
    let shippings = await this.shippingRepository.find({
      where: { user: { id: userId } },
    });
    if (shippings) {
      return shippings;
    } else {
      throw new NotFoundException('All address of current user not found');
    }
  }

  async findOne(id: number): Promise<ShippingEntity> {
    let shipping = await this.shippingRepository.findOne({
      where: { id },
    });

    if (!shipping) {
      throw new NotFoundException('Shipping not found');
    }

    return shipping;
  }

  async update(
    id: number,
    updateShippingDto: UpdateShippingDto,
    currentUser: UserEntity,
  ) {
    const shippings = await this.shippingRepository.findOne({
      where: {
        id,
        user: {
          id: currentUser.id,
        },
      },
    });

    if (shippings) {
      //remove default address if exist
      if (updateShippingDto.isDefaultAddress) {
        await this.removeDefaultAddress(currentUser);
      }

      Object.assign(shippings, updateShippingDto);

      Object.assign(shippings, { user: currentUser, updatedAt: new Date() });

      return await this.shippingRepository.save(shippings);
    } else {
      throw new NotFoundException('Shipping address of current user not found');
    }
  }

  async delete(id: number, currentUser: UserEntity) {
    const shippings = await this.shippingRepository.findOne({
      where: {
        id,
        user: {
          id: currentUser.id,
        },
      },
    });

    if (shippings) {
      return await this.shippingRepository.remove(shippings);
    } else {
      throw new NotFoundException('Shipping address of current user not found');
    }
  }

  //edit default address if exist
  async removeDefaultAddress(currentUser: UserEntity) {
    let currentDefaultAddress = await this.shippingRepository.findOne({
      where: {
        isDefaultAddress: true,
        user: {
          id: currentUser.id,
        },
      },
    });
    if (currentDefaultAddress) {
      currentDefaultAddress.isDefaultAddress = false;
      await this.shippingRepository.save(currentDefaultAddress);
    }
  }

  async findDefaultShipping(currentUser: UserEntity) {
    const shipping = await this.shippingRepository.findOne({
      where: {
        isDefaultAddress: true,
        user: {
          id: currentUser.id,
        },
      },
    });

    return shipping;
  }
}
