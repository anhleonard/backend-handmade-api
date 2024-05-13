import { PartialType } from '@nestjs/mapped-types';
import { CreateVariantDto } from './create-variants.dto';

export class UpdateVariantDto extends PartialType(CreateVariantDto) {}
