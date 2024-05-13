import { CategoryEntity } from 'src/categories/entities/category.entity';
import { Variant } from 'src/constants/defined-class';
import { OrderProductEntity } from 'src/order_products/entities/order-products.entity';
import { ReviewEntity } from 'src/reviews/entities/review.entity';
import { CollectionEntity } from 'src/store_collections/entities/collection.entity';
import { StoreEntity } from 'src/stores/entities/stores.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { VariantCategoryEntity } from 'src/variant_categories/entities/variant-category.entity';
import { VariantEntity } from 'src/variants/entities/variant.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import { ProductStatus } from '../enum/product.enum';
import moment from 'moment';

@Entity({ name: 'products' })
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productName: string;

  @Column({ unique: true })
  productCode: string;

  @Column()
  description: string;

  @Column()
  materials: string;

  @Column()
  mainColors: string;

  @Column()
  uses: string;

  @Column({ nullable: true })
  productionDate: Date;

  @Column({ nullable: true })
  expirationDate: Date;

  @Column()
  isHeavyGood: boolean;

  @Column()
  isMultipleClasses: boolean;

  @Column({ nullable: true })
  inventoryNumber: number;

  @Column({
    type: 'decimal',
    precision: 30,
    scale: 0,
    nullable: true,
  })
  price: number;

  @Column('decimal', { default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  soldNumber: number;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ nullable: true })
  discount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false }) // product được duyệt bởi admin hay chưa
  isAccepted: boolean;

  @Column({ nullable: true }) // tại sao product bị reject
  rejectReason: string;

  @Column({ nullable: true }) // giá mà handmade thu lại
  profitMoney: number;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.PENDING })
  status: ProductStatus;

  @ManyToOne(() => UserEntity, (user) => user.products)
  addedBy: UserEntity;

  @ManyToMany(() => CategoryEntity, (cat) => cat.products)
  @JoinTable({ name: 'category_product' })
  category: CategoryEntity[];

  @OneToMany(() => ReviewEntity, (rev) => rev.product)
  reviews: ReviewEntity[];

  @OneToMany(() => OrderProductEntity, (op) => op.product)
  products: OrderProductEntity[];

  @OneToMany(() => VariantEntity, (item) => item.product, { nullable: true })
  variants: VariantEntity[];

  @ManyToMany(() => UserEntity, (user) => user.favouriteProducts)
  @JoinTable({ name: 'user_favourite_product' })
  lovedUsers: UserEntity[];

  @ManyToOne(() => StoreEntity, (store) => store.products)
  store: StoreEntity;

  @ManyToOne(() => CollectionEntity, (collection) => collection.products, {
    onDelete: 'SET NULL',
  })
  collection: CollectionEntity;

  @ManyToMany(() => VariantCategoryEntity, (cate) => cate.products)
  variantCategories: VariantCategoryEntity[];
}
