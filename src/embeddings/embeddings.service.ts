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
import { UpdateEmbeddingDto } from './dto/update-embedding.dto';
import { AI_URL } from 'src/default';

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
      const res = await axios.post(`${AI_URL}/embed`, {
        text,
      });

      const embedding = this.embeddingRepository.create();

      embedding.vector = res.data;
      embedding.store = store;

      await this.embeddingRepository.save(embedding);

      return store;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(updateEmbeddingDto: UpdateEmbeddingDto) {
    const store = await this.storeRepository.findOne({
      where: {
        id: updateEmbeddingDto.storeId,
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found.');
    }

    const embedding = await this.embeddingRepository.findOne({
      where: {
        store: {
          id: updateEmbeddingDto.storeId,
        },
      },
    });

    const text = updateEmbeddingDto.description.toString();

    //nếu store chưa có thì tạo mới
    if (!embedding) {
      try {
        const res = await axios.post(`${AI_URL}/embed`, {
          text,
        });

        const embedding = this.embeddingRepository.create();

        embedding.vector = res.data;
        embedding.store = store;

        await this.embeddingRepository.save(embedding);

        return store;
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }

    //nếu có rồi thì update thôi
    try {
      const res = await axios.post(`${AI_URL}/embed`, {
        text,
      });

      embedding.vector = res.data;

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
      input: sortEmbeddingDto.desc.toString(),
    };

    try {
      const res = await axios.post(`${AI_URL}/find-relational-stores`, data);

      const ids = res.data;

      const sortedStores: StoreEntity[] = [];
      for (let id of ids) {
        const foundStore = await this.storeRepository.findOne({
          where: {
            id,
          },
        });
        sortedStores.push(foundStore);
      }

      return sortedStores;
    } catch (error) {
      return error.message;
    }
  }
}
