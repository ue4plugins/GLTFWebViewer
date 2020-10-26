import deepmerge from "deepmerge";
import { Config, defaultConfig } from "./config";

export async function fetchConfig(): Promise<Config> {
  try {
    const res = await fetch("index.json");
    const overrides = (await res.json()) as Partial<Config>;
    return deepmerge(defaultConfig, overrides);
  } catch (e) {
    // Ignore since it should be possible to start the application
    // without assets
  }

  return defaultConfig;
}
