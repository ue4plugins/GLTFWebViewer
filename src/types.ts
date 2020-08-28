import { VariantSetManager } from "./variants";

export type GltfSource = {
  filePath: string;
  blobFileName?: string;
  name: string;
  description?: string;
  creator?: string;
  creatorUrl?: string;
};

export type GltfAnimation = {
  id: number;
  name: string;
  active: boolean;
};

export type GltfCamera = {
  id: number;
  name: string;
  orbit: boolean;
  previewSource?: string;
};

export type GltfScene = {
  animations: GltfAnimation[];
  variantSetManager?: VariantSetManager;
  cameras: GltfCamera[];
  hasBackdrops: boolean;
};
