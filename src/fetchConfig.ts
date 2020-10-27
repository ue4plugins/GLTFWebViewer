import deepmerge from "deepmerge";
import { Config, defaultConfig } from "./config";
import { waitFor } from "./utilities";

export async function fetchConfig(): Promise<Config> {
  const minLoadingTime = waitFor(1500);

  try {
    const res = await fetch("index.json");
    const overrides = (await res.json()) as Partial<Config>;
    await minLoadingTime;
    return deepmerge(defaultConfig, overrides);
  } catch (e) {
    // Ignore since it should be possible to start the application
    // without assets
  }

  return defaultConfig;
}
