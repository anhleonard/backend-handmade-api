import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreEntity } from './entities/stores.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { EmbeddingsModule } from 'src/embeddings/embeddings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StoreEntity, UserEntity]),
    EmbeddingsModule,
  ],
  providers: [StoresService],
  controllers: [StoresController],
})
export class StoresModule {}
