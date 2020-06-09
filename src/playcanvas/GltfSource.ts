export type GltfSource = {
  filePath: string;
  blobFileName?: string;
  name: string;
  description?: string;
  creator?: string;
  creatorUrl?: string;
};

export type GltfFileAnimation = {
  id: number;
  name: string;
  active: boolean;
};
