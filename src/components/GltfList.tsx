import React from "react";
import { List, ListItem, ListItemText } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { observer } from "mobx-react-lite";
import { useStores } from "../stores";

const useStyles = makeStyles(() => ({
  list: {
    maxHeight: "100%",
    overflow: "auto",
    textTransform: "capitalize",
  },
}));

export type GltfListProps = {
  onSelect?: () => void;
};

export const GltfList: React.FC<GltfListProps> = observer(({ onSelect }) => {
  const classes = useStyles();
  const { gltfStore } = useStores();
  const { gltf: selectedGltf, gltfs, setGltf } = gltfStore;

  return (
    <List id="gltf-list" className={classes.list}>
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
