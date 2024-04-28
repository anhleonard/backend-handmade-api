export type VariantItem = {
  optionName: string;

  variantPrice: number;

  inventoryNumber: number;

  image: string;
};

export type Variant = {
  variantName: string;

  options: VariantItem[];
};
