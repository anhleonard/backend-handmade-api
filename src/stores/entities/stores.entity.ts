import { OrderEntity } from 'src/orders/entities/order.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { CollectionEntity } from 'src/store_collections/entities/collection.entity';
import { UserEntity } from 'src/users/entities/user.entity';
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

@Entity({ name: 'stores' })
export class StoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  avatar: string;

  @Column({ default: false })
  isBanned: boolean;

  @Column()
  description: string;

  @Column()
  mainBusiness: string;

  @CreateDateColumn()
  createdAt: Timestamp;

  @UpdateDateColumn()
  updatedAt: Timestamp;

  @Column({ default: 0 })
  productAmount: number;

  @Column({ default: 0 })
  avgStoreRating: number;

  @Column({ default: 0 })
  followerAmount: number;

  @Column({ default: 0 })
  returnRate: number;

  @Column({ default: 0 })
  canceledRate: number;

  @OneToOne(() => UserEntity, (user) => user.store)
  @JoinColumn()
  owner: UserEntity;

  @OneToMany(() => ProductEntity, (product) => product.store)
  products: ProductEntity[];

  @OneToMany(() => CollectionEntity, (collection) => collection.store)
  collections: CollectionEntity[];

  @ManyToMany(() => UserEntity, (user) => user.lovedStores)
  @JoinTable({ name: 'store_followers' })
  followers: UserEntity[];

  @OneToMany(() => OrderEntity, (order) => order.store)
  orders: OrderEntity[];
}
