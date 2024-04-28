import { CategoryEntity } from 'src/categories/entities/category.entity';
import { OrderEntity } from 'src/orders/entities/order.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { ReviewEntity } from 'src/reviews/entities/review.entity';
import { ShippingEntity } from 'src/shippings/entities/shipping.entity';
import { Genders, Roles } from 'src/utility/common/user-roles.enum';
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

  @Column({ type: 'enum', enum: Genders, array: false })
  gender: Genders;

  @Column()
  dateOfBirth: Date;

  @CreateDateColumn()
  createdAt: Timestamp;

  @UpdateDateColumn()
  updatedAt: Timestamp;

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
}
