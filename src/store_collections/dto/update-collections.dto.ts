import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCollectionDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  collectionProductIds: number[];
}
