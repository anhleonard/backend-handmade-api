import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { TokenEntity } from './entities/token.entity';
import { Repository } from 'typeorm';
import { CreateRandomTokenDto } from './dto/create-random-token.dto';

@Injectable()
export class TokensService {
  @InjectRepository(TokenEntity)
  private readonly tokenRepository: Repository<TokenEntity>;

  async randomToken() {
    const stringBase = 'base64';
    const byteLength = 12;

    const randomToken: string = await new Promise((resolve, reject) => {
      crypto.randomBytes(byteLength, (err, buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer.toString('hex'));
        }
      });
    });

    const createRandomTokenDto: CreateRandomTokenDto = {
      token: randomToken,
    };

    const token = this.tokenRepository.create(createRandomTokenDto);

    return await this.tokenRepository.save(token);
  }

  async checkAlreadyToken(body: any) {
    if (body?.token) {
      const foundToken = await this.tokenRepository.findOne({
        where: {
          token: body?.token,
        },
      });

      if (!foundToken) {
        return false;
      } else return foundToken;
    }

    return false;
  }
}
