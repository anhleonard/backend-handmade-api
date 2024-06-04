import { Body, Controller, Post } from '@nestjs/common';
import { EmbeddingsService } from './embeddings.service';
import { CreateEmbeddingDto } from './dto/create-embedding.dto';
import { SortEmbeddingDto } from './dto/sort-embedding.dto';

@Controller('embeddings')
export class EmbeddingsController {
  constructor(private readonly embeddingService: EmbeddingsService) {}

  @Post('/create')
  async create(@Body() createEmbeddingDto: CreateEmbeddingDto) {
    return await this.embeddingService.create(createEmbeddingDto);
  }

  @Post('/sort')
  async sort(@Body() sortEmbeddingDto: SortEmbeddingDto) {
    return await this.embeddingService.sort(sortEmbeddingDto);
  }
}
