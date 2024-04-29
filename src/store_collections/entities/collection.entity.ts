import { StoreEntity } from 'src/stores/entities/stores.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'collections' })
export class CollectionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => StoreEntity, (store) => store.collections)
  store: StoreEntity;
}
