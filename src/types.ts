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

export type GltfScene = {
  id: number;
  name: string;
  animations: GltfAnimation[];
};
