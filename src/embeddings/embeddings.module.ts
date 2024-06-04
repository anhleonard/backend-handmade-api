import { Module } from '@nestjs/common';
import { EmbeddingsController } from './embeddings.controller';
import { EmbeddingsService } from './embeddings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreEntity } from 'src/stores/entities/stores.entity';
import { EmbeddingEntity } from './entities/embedding.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StoreEntity, EmbeddingEntity])],
  controllers: [EmbeddingsController],
  providers: [EmbeddingsService],
})
export class EmbeddingsModule {}
