import { Variant } from "./Variant";

export type LevelVariantSet = {
  name: string;
  variantSets: VariantSet[];
};

export type VariantSet = {
  name: string;
  variants: Variant[];
};
