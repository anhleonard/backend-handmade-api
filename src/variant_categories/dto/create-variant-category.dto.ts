import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateVariantCategoryDto {
  @IsNotEmpty({ message: 'variant category title can not be blank.' })
  @IsString()
  title: string; // ví dụ Màu, Size

  @IsNotEmpty({ message: 'values of this variant category can not be blank.' })
  @IsArray()
  values: string[]; // ví dụ Đen, XXL
}
