import React, { createContext, useContext } from "react";
import { ModelStore } from "./ModelStore";
import { SceneStore } from "./SceneStore";

export class RootStore {
  public modelStore = new ModelStore();
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
