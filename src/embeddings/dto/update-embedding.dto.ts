import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateEmbeddingDto {
  @IsNotEmpty({ message: 'store id is not empty' })
  @IsNumber()
  storeId: number;

  @IsNotEmpty({ message: 'description is not empty' })
  @IsString()
  description: string;
}
