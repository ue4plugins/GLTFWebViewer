import React from "react";
import { observer } from "mobx-react-lite";
import { SceneSelector } from "../components";
import { useStores } from "../stores";

export const Settings: React.FC = observer(() => {
  const { gltfStore } = useStores();
  const { hasBackdrops } = gltfStore;
  return <SceneSelector disabled={hasBackdrops} />;
});
