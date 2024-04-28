import { Expose, Transform, Type } from 'class-transformer';

export class ProductsDto {
  @Expose()
  totalProducts: number;
  @Expose()
  limit: number;
  @Expose()
  @Type(() => ProductList)
  products: ProductList[];
}

export class ProductList {
  @Expose({ name: 'product_id' })
  id: number;

  @Expose({ name: 'product_name' })
  productName: string;

  @Expose({ name: 'product_code' })
  productCode: string;

  @Expose({ name: 'product_description' })
  description: string;

  @Expose({ name: 'product_materials' })
  materials: string;

  @Expose({ name: 'product_main_colors' })
  mainColors: string;

  @Expose({ name: 'product_uses' })
  uses: string;

  @Expose({ name: 'production_date' })
  productionDate: Date;

  @Expose({ name: 'expiration_date' })
  expirationDate: Date;

  @Expose({ name: 'product_heavy_good' })
  isHeavyGood: boolean;

  @Expose({ name: 'product_multiple_classes' })
  isMultipleClasses: boolean;

  @Expose({ name: 'product_price' })
  price: number;

  @Expose({ name: 'inventory_number' })
  inventoryNumber: number;

  @Expose({ name: 'product_images' })
  // @Transform(({ value }) => value.toString().split(','))
  images: string[];

  @Transform(({ obj }) => {
    return {
      id: obj.category_id,
      title: obj.category_title,
    };
  })
  @Expose()
  category: any;

  @Expose({ name: 'reviewcount' })
  review: number;

  @Expose({ name: 'avgrating' })
  rating: number;
}
