import { IsNotEmpty, IsString } from 'class-validator';

export class SortEmbeddingDto {
  @IsNotEmpty()
  @IsString()
  desc: string;
}
