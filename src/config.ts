import deepmerge from "deepmerge";
import { GltfSource } from "./types";

export type ConfigTheme = {
  palette: {
    primary: string;
    secondary: string;
  };
};

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

export const defaultConfig: Config = {
  gltfs: [],
  topbar: true,
  sidebar: true,
  cameras: true,
  dragAndDrop: true,
  topbarTitle: "Epic Games glTF Viewer",
  topbarLogoUrl: "viewer/logo.svg",
  theme: {
    palette: {
      primary: "#3393FA",
      secondary: "#75FABB",
    },
  },
};

export async function fetchConfig() {
  let config: Config = defaultConfig;

  try {
    const res = await fetch("index.json");
    const overrides = (await res.json()) as Partial<Config>;
    config = deepmerge(config, overrides);
  } catch (e) {
    // Ignore since it should be possible to start the application
    // without assets
  }

  return config;
}
