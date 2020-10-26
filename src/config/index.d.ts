declare namespace config {
  export type Config = {
    gltfs: GltfSource[];
    topbar: boolean;
    sidebar: boolean;
    cameras: boolean;
    dragAndDrop: boolean;
    topbarTitle: string;
    topbarLogoUrl: string;
    theme: ConfigTheme;
  };

  export const defaultConfig: Config;
}

export = config;
