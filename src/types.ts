import { VariantSetManager } from "./variants";

export type GltfSource = {
  filePath: string;
  blobFileName?: string;
  name: string;
  description?: string;
  creator?: string;
  creatorUrl?: string;
};

export type GltfCamera = {
  id: number;
  name: string;
  type: "Static" | "FreeLook" | "Orbital";
  previewSource: string;
};

export type GltfScene = {
  variantSetManager?: VariantSetManager;
  cameras: GltfCamera[];
  hasBackdrops: boolean;
};
