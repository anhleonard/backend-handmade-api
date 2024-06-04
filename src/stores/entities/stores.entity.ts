import { BidderEntity } from 'src/auctions/entities/bidder.entity';
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
import { StoreStatus } from '../enum/stores.enum';
import { EmbeddingEntity } from 'src/embeddings/entities/embedding.entity';

@Entity({ name: 'stores' })
export class StoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  avatar: string;

  @Column()
  description: string;

  @Column()
  mainBusiness: string;

  @Column({ nullable: true })
  address: string;

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

  @Column({ nullable: true })
  bannedReason: string; //lý do cấm store

  @Column({ nullable: true })
  notApproveReason: string; //lý do không duyệt store

  @Column({ default: StoreStatus.INACTIVE })
  status: StoreStatus;

  @Column({ default: 1000 })
  score: number;

  @OneToOne(() => UserEntity, (user) => user.store)
  @JoinColumn()
  owner: UserEntity;

  @OneToOne(() => EmbeddingEntity, (embed) => embed.store)
  @JoinColumn()
  embedding: EmbeddingEntity;

  @OneToMany(() => ProductEntity, (product) => product.store)
  products: ProductEntity[];

  @OneToMany(() => CollectionEntity, (collection) => collection.store)
  collections: CollectionEntity[];

  @ManyToMany(() => UserEntity, (user) => user.lovedStores)
  @JoinTable({ name: 'store_followers' })
  followers: UserEntity[];

  @OneToMany(() => OrderEntity, (order) => order.store)
  orders: OrderEntity[];

  @OneToMany(() => BidderEntity, (bidder) => bidder.store)
  bidders: BidderEntity[];
}
