import { VariantEntity } from 'src/variants/entities/variant.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('variant_items')
export class VariantItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  optionName: string;

  @Column()
  variantPrice: number;

  @Column()
  inventoryNumber: number;

  @Column()
  image: string;

  @ManyToOne(() => VariantEntity, (item) => item.options)
  variants: VariantEntity;
}
