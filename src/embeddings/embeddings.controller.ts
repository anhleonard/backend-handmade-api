import { Body, Controller, Post, Put } from '@nestjs/common';
import { EmbeddingsService } from './embeddings.service';
import { CreateEmbeddingDto } from './dto/create-embedding.dto';
import { SortEmbeddingDto } from './dto/sort-embedding.dto';
import { UpdateEmbeddingDto } from './dto/update-embedding.dto';

@Controller('embeddings')
export class EmbeddingsController {
  constructor(private readonly embeddingService: EmbeddingsService) {}

  @Post('/create')
  async create(@Body() createEmbeddingDto: CreateEmbeddingDto) {
    return await this.embeddingService.create(createEmbeddingDto);
  }

  @Put('/update')
  async update(@Body() updateEmbeddingDto: UpdateEmbeddingDto) {
    return await this.embeddingService.update(updateEmbeddingDto);
  }

  @Post('/sort')
  async sort(@Body() sortEmbeddingDto: SortEmbeddingDto) {
    return await this.embeddingService.sort(sortEmbeddingDto);
  }
}
