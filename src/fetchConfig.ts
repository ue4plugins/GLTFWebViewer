import deepmerge from "deepmerge";
import { Config, defaultConfig } from "./config";

export type ConfigTheme = {
  palette: {
    primary: string;
    secondary: string;
  };
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
