import React, { createContext, useContext } from "react";
import { GltfStore } from "./GltfStore";
import { SettingsStore } from "./SettingsStore";

export class RootStore {
  public gltfStore = new GltfStore();
  public settingsStore = new SettingsStore();
}

export const RootStoreContext = createContext<RootStore>({} as RootStore);

export const RootStoreProvider: React.FC = ({ children }) => (
  <RootStoreContext.Provider value={new RootStore()}>
    {children}
  </RootStoreContext.Provider>
);

export const useStores = (): RootStore =>
  useContext<RootStore>(RootStoreContext);
