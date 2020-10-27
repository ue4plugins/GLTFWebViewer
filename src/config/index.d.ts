declare namespace config {
  type Config = {
    assets: GltfSource[];
    topbar: boolean;
    sidebar: boolean;
    cameras: boolean;
    dragAndDrop: boolean;
    topbarTitle: string;
    topbarLogoUrl: string;
  };

  const defaultConfig: Config;
}

export = config;
