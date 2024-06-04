import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StoreEntity } from 'src/stores/entities/stores.entity';
import { Repository } from 'typeorm';
import { CreateEmbeddingDto } from './dto/create-embedding.dto';
import axios from 'axios';
import { EmbeddingEntity } from './entities/embedding.entity';
import { SortEmbeddingDto } from './dto/sort-embedding.dto';
import { EmbeddingStore } from 'src/constants/defined-class';

@Injectable()
export class EmbeddingsService {
  constructor(
    @InjectRepository(EmbeddingEntity)
    private readonly embeddingRepository: Repository<EmbeddingEntity>,
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
  ) {}

  async create(createEmbeddingDto: CreateEmbeddingDto) {
    const store = await this.storeRepository.findOne({
      where: {
        id: createEmbeddingDto.storeId,
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const text = store.description;

    try {
      const res = await axios.post('http://localhost:8000/embed', {
        text,
      });

      const embedding = this.embeddingRepository.create();

      embedding.vector = res.data;
      embedding.store = store;

      return await this.embeddingRepository.save(embedding);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async sort(sortEmbeddingDto: SortEmbeddingDto) {
    const embeddingStores = await this.embeddingRepository.find({
      relations: {
        store: true,
      },
    });

    if (!embeddingStores) {
      throw new NotFoundException('Store embeddings not found.');
    }

    const storeDatas = embeddingStores.map((item) => ({
      storeId: item.store.id,
      embedding: item.vector.toString(), // Ensure embedding is a string
    }));

    const data = {
      stores: storeDatas,
    };

    try {
      const res = await axios.post(
        'http://localhost:8000/find-relational-stores',
        data,
      );

      return res.data;
    } catch (error) {
      return error.message;
    }
  }
}
