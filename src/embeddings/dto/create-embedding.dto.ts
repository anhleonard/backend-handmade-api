import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateEmbeddingDto {
  @IsNotEmpty({ message: 'store id is not empty' })
  @IsNumber()
  storeId: number;
}
