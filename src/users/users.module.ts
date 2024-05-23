import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { TokenEntity } from 'src/tokens/entities/token.entity';
import { TokensModule } from 'src/tokens/tokens.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, TokenEntity]),
    JwtModule,
    MailerModule.forRoot({
      transport: {
        host: 'sandbox.smtp.mailtrap.io',
        port: 587,
        auth: {
          user: '38d0fbf3a02ad9',
          pass: 'b3235cc2a1d440',
        },
      },
    }),
    TokensModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
