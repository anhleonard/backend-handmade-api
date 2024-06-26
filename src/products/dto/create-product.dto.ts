import {
  IsAlphanumeric,
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'productName can not be blank.' })
  @IsString()
  productName: string;

  @IsNotEmpty({ message: 'productCode can not be blank.' })
  @IsAlphanumeric()
  @Length(8, 10, {
    message: 'productCode must be between 8 and 10 characters.',
  })
  productCode: string;

  @IsNotEmpty({ message: 'category should not be empty.' })
  @IsArray({ message: 'category id should be an array' })
  categoryId: number[];

  @IsNotEmpty({ message: 'description can not be empty.' })
  @IsString()
  description: string;

  @IsNotEmpty({ message: 'materials can not be blank.' })
  @IsString()
  materials: string;

  @IsNotEmpty({ message: 'mainColors can not be blank.' })
  @IsString()
  mainColors: string;

  @IsNotEmpty({ message: 'uses can not be blank.' })
  @IsString()
  uses: string;

  @IsOptional()
  @IsDate()
  productionDate: Date;

  @IsOptional()
  @IsDate()
  expirationDate: Date;

  @IsNotEmpty({ message: 'isHeavyGood can not be blank.' })
  @IsBoolean()
  isHeavyGood: boolean;

  @IsNotEmpty({ message: 'isMultipleClasses can not be blank.' })
  @IsBoolean()
  isMultipleClasses: boolean;

  @ValidateIf((object, value) => !object.isMultipleClasses)
  @IsNumber(
    { maxDecimalPlaces: 0 },
    { message: 'price should be number & max decimal precission 2' },
  )
  @IsPositive({ message: 'price should be positive number' })
  price: number;

  @ValidateIf((object, value) => !object.isMultipleClasses)
  @IsNumber({}, { message: 'inventoryNumber should be number' })
  inventoryNumber: number;

  @ValidateIf((object, value) => !object.isMultipleClasses)
  @IsArray({ message: 'images should be in array format.' })
  images: string[];

  @ValidateIf((object, value) => object.isMultipleClasses)
  @IsArray({ message: 'variants should be in array format.' })
  sampleVariants: any;

  @IsOptional()
  @IsNumber({}, { message: 'variants should be in array format.' })
  @Min(2, { message: 'discount is greater than or equal to 2' })
  @Max(99, { message: 'discount is  less than or equal to 99' })
  discount: number;
}
