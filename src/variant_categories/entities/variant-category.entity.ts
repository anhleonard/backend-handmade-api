import { ProductEntity } from 'src/products/entities/product.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { VariantItemEntity } from 'src/variant_items/entities/variant-item.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('variant_categories')
export class VariantCategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  variantName: string;

  @OneToMany(() => VariantItemEntity, (item) => item.variantCategory, {
    onDelete: 'SET NULL',
    cascade: true,
  })
  variantItems: VariantItemEntity[];

  @ManyToMany(() => ProductEntity, (product) => product.variantCategories, {
    onDelete: 'SET NULL',
    cascade: true,
  })
  @JoinTable({ name: 'variant_category_product' })
  products: ProductEntity[];

  @ManyToOne(() => UserEntity, (user) => user.variantCategories, {
    onDelete: 'SET NULL',
  })
  addedBy: UserEntity;
}
