import { StoreEntity } from 'src/stores/entities/stores.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'embeddings' })
export class EmbeddingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  vector: string;

  @OneToOne(() => StoreEntity, (store) => store.embedding)
  @JoinColumn()
  store: StoreEntity;
}
