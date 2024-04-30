import { VariantCategoryEntity } from 'src/variant_categories/entities/variant-category.entity';
import { VariantEntity } from 'src/variants/entities/variant.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('variant_items')
export class VariantItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => VariantEntity, (item) => item.options)
  variants: VariantEntity;

  @ManyToOne(() => VariantCategoryEntity, (category) => category.variantItems)
  variantCategory: VariantCategoryEntity;
}
