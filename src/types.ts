import { Configurator } from "./configurator";
import { Variant } from "./playcanvas/extensions";

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
};

export type GltfVariantSetMeta = { name: string };
export type GltfVariant = Variant;
export type GltfVariantSetConfigurator = Configurator<
  GltfVariantSetMeta,
  GltfVariant
>;

export type GltfScene = {
  animations: GltfAnimation[];
  configurator?: GltfVariantSetConfigurator;
  cameras: GltfCamera[];
};
