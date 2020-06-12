import React, { createContext, useContext } from "react";
import { GltfStore } from "./GltfStore";
import { SceneStore } from "./SceneStore";

export class RootStore {
  public gltfStore = new GltfStore();
  public sceneStore = new SceneStore();
}

export const RootStoreContext = createContext<RootStore>({} as RootStore);

export const RootStoreProvider: React.FC = ({ children }) => (
  <RootStoreContext.Provider value={new RootStore()}>
    {children}
  </RootStoreContext.Provider>
);

export const useStores = (): RootStore =>
  useContext<RootStore>(RootStoreContext);
