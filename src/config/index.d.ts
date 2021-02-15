declare namespace config {
  type ConfigTheme = {
    palette: {
      primary: string;
    };
  };

  type Config = {
    assets: GltfSource[];
    topbar: boolean;
    sidebar: boolean;
    cameras: boolean;
    dragAndDrop: boolean;
    topbarTitle: string;
    topbarLogoUrl: string;
    theme: ConfigTheme;
  };

  const defaultConfig: Config;
}

export = config;
