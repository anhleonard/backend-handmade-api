import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateCollectionDto {
  @IsNotEmpty({ message: 'collection name is not empty' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'collection products is not empty' })
  @IsArray()
  collectionProductIds: number[];
}
