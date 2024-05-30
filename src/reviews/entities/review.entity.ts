import { OrderEntity } from 'src/orders/entities/order.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'reviews' })
export class ReviewEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ratings: number;

  @Column()
  comment: string;

  @Column({ default: false })
  isReported: boolean;

  @Column({ nullable: true })
  reportedReason: string;

  @CreateDateColumn()
  createdAt: Timestamp;

  @UpdateDateColumn()
  updatedAt: Timestamp;

  @ManyToOne((type) => UserEntity, (user) => user.reviews, {
    onDelete: 'SET NULL',
  })
  user: UserEntity;

  @ManyToOne((type) => ProductEntity, (prod) => prod.reviews, {
    onDelete: 'SET NULL',
  })
  product: ProductEntity;

  @ManyToOne((type) => OrderEntity, (order) => order.reviews, {
    onDelete: 'SET NULL',
  })
  order: OrderEntity;
}
