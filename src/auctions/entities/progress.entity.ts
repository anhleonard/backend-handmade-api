import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import { AuctionEntity } from './auction.entity';
import { UserEntity } from 'src/users/entities/user.entity';

@Entity({ name: 'progresses' })
export class ProgressEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true }) // null khi user đăng comment
  percentage: number;

  @Column()
  comment: string;

  @CreateDateColumn()
  createdAt: Timestamp;

  @UpdateDateColumn()
  updatedAt: Timestamp;

  @ManyToOne(() => AuctionEntity, (pro) => pro.progresses)
  auction: AuctionEntity;

  @ManyToOne(() => UserEntity, (user) => user.progresses)
  user: UserEntity;
}
