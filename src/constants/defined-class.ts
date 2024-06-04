export type VariantItem = {
  optionName: string;

  unitPrice: number;

  inventoryNumber: number;

  image: string;
};

export type Variant = {
  variantName: string;

  options: VariantItem[];
};

export type EmbeddingStore = {
  storeId: number;
  vector: string;
};
