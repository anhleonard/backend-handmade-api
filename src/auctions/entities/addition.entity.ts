import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import { AuctionEntity } from './auction.entity';
import { UserEntity } from 'src/users/entities/user.entity';

@Entity({ name: 'additions' })
export class AdditionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  days: number;

  @Column()
  comment: string;

  @Column({ default: false })
  isAccepted: boolean;

  @CreateDateColumn()
  createdAt: Timestamp;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => AuctionEntity, (auction) => auction.addition)
  @JoinColumn()
  auction: AuctionEntity;

  @ManyToOne(() => UserEntity, (user) => user.additions)
  user: UserEntity;
}
