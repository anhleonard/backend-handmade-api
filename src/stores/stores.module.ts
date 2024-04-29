import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreEntity } from './entities/stores.entity';
import { UserEntity } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StoreEntity, UserEntity])],
  providers: [StoresService],
  controllers: [StoresController],
})
export class StoresModule {}
