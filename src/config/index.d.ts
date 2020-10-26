declare namespace config {
  export type Config = {
    assets: GltfSource[];
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
