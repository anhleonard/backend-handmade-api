import { VariantCategoryEntity } from 'src/variant_categories/entities/variant-category.entity';
import { VariantEntity } from 'src/variants/entities/variant.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('variant_items')
export class VariantItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => VariantEntity, (item) => item.variantItems)
  variants: VariantEntity[];

  @ManyToOne(() => VariantCategoryEntity, (category) => category.variantItems, {
    onDelete: 'SET NULL',
  })
  variantCategory: VariantCategoryEntity;
}
