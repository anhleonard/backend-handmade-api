import { AdditionEntity } from 'src/auctions/entities/addition.entity';
import { AuctionEntity } from 'src/auctions/entities/auction.entity';
import { ProgressEntity } from 'src/auctions/entities/progress.entity';
import { CategoryEntity } from 'src/categories/entities/category.entity';
import { OrderProductEntity } from 'src/order_products/entities/order-products.entity';
import { OrderEntity } from 'src/orders/entities/order.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { ReviewEntity } from 'src/reviews/entities/review.entity';
import { ShippingEntity } from 'src/shippings/entities/shipping.entity';
import { StoreEntity } from 'src/stores/entities/stores.entity';
import { Genders, Roles } from 'src/utility/common/user-roles.enum';
import { VariantCategoryEntity } from 'src/variant_categories/entities/variant-category.entity';
import { VariantEntity } from 'src/variants/entities/variant.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'enum', enum: Roles, array: false })
  role: Roles;

  @Column()
  phoneNumber: string;

  @Column({ type: 'enum', enum: Genders, array: false, nullable: true })
  gender: Genders;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @CreateDateColumn()
  createdAt: Timestamp;

  @UpdateDateColumn()
  updatedAt: Timestamp;

  @Column({ default: false })
  hasStore: boolean;

  @Column({ nullable: true })
  frontCard: string;

  @Column({ nullable: true })
  backCard: string;

  @OneToMany(() => CategoryEntity, (cat) => cat.addedBy)
  categories: CategoryEntity[];

  @OneToMany(() => ProductEntity, (prod) => prod.addedBy)
  products: ProductEntity[];

  @OneToMany(() => ReviewEntity, (rev) => rev.user)
  reviews: ReviewEntity[];

  @OneToMany(() => OrderEntity, (order) => order.updatedBy)
  ordersUpdateBy: OrderEntity[];

  @OneToMany(() => OrderEntity, (order) => order.client)
  orders: OrderEntity[];

  @OneToMany(() => ShippingEntity, (ship) => ship.user)
  shippings: ShippingEntity[];

  @ManyToMany(() => ProductEntity, (product) => product.lovedUsers)
  favouriteProducts: ProductEntity[];

  @OneToOne(() => StoreEntity, (store) => store.owner)
  store: StoreEntity;

  @ManyToMany(() => StoreEntity, (store) => store.followers)
  lovedStores: StoreEntity[];

  @OneToMany(() => VariantCategoryEntity, (cate) => cate.addedBy)
  variantCategories: VariantCategoryEntity[];

  @OneToMany(() => OrderProductEntity, (orderProduct) => orderProduct.client)
  orderProducts: OrderProductEntity[];

  @OneToMany(() => AuctionEntity, (user) => user.owner)
  auctions: AuctionEntity[];

  @OneToMany(() => ProgressEntity, (pro) => pro.user)
  progresses: ProgressEntity[];

  @OneToMany(() => VariantEntity, (variant) => variant.addedBy)
  variants: VariantEntity[];

  @ManyToOne(() => AdditionEntity, (add) => add.user)
  additions: AdditionEntity[];
}
