import { ProductEntity } from 'src/products/entities/product.entity';
import { StoreEntity } from 'src/stores/entities/stores.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'collections' })
export class CollectionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => StoreEntity, (store) => store.collections)
  store: StoreEntity;

  @OneToMany(() => ProductEntity, (product) => product.collection, {
    onDelete: 'SET NULL',
    cascade: true,
  })
  products: ProductEntity[];
}
