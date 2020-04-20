import React, { createContext, useContext } from "react";
import { RootStore } from "./RootStore";

export const RootStoreContext = createContext<RootStore>({} as RootStore);

export const RootStoreProvider: React.FC = ({ children }) => (
  <RootStoreContext.Provider value={new RootStore()}>
    {children}
  </RootStoreContext.Provider>
);

export const useStores = (): RootStore =>
  useContext<RootStore>(RootStoreContext);
