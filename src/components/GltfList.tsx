import React from "react";
import { List, ListItem, ListItemText } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { useStores } from "../stores";

export type GltfListProps = {
  onSelect?: () => void;
};

export const GltfList: React.FC<GltfListProps> = observer(({ onSelect }) => {
  const { gltfStore } = useStores();
  const { gltf: selectedGltf, gltfs, setGltf } = gltfStore;

  return (
    <List id="gltf-list">
      {gltfs.map(gltf => (
        <ListItem
          onClick={() => {
            setGltf(gltf);
            if (onSelect) {
              onSelect();
            }
          }}
          button
          key={gltf.filePath}
          selected={selectedGltf && gltf.filePath === selectedGltf.filePath}
        >
          <ListItemText primary={gltf.name} secondary={gltf.description} />
        </ListItem>
      ))}
    </List>
  );
});
