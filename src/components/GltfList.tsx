import React, { useEffect, useState } from "react";
import Fuse, { FuseOptions } from "fuse.js";
import { List, ListItem, ListItemText, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { observer } from "mobx-react-lite";
import { useStores } from "../stores";
import { GltfSource } from "../types";
import { SearchField } from "./SearchField";

const useStyles = makeStyles(() => ({
  list: {
    maxHeight: "100%",
    overflow: "auto",
    textTransform: "capitalize",
  },
}));

const fuseOptions: FuseOptions<GltfSource> = {
  shouldSort: true,
  includeScore: false,
  threshold: 0.6,
  location: 0,
  distance: 100,
  minMatchCharLength: 0,
  keys: ["name"],
};

export type GltfListProps = {
  onSelect?: () => void;
};

export const GltfList: React.FC<GltfListProps> = observer(({ onSelect }) => {
  const classes = useStyles();
  const { gltfStore } = useStores();
  const { gltf: selectedGltf, gltfs, setGltf } = gltfStore;
  const [searchTerm, setSearchTerm] = useState("");
  const [fuse, setFuse] = useState<Fuse<GltfSource, typeof fuseOptions>>();
  const [list, setList] = useState(gltfs);

  useEffect(() => {
    setFuse(gltfs.length > 0 ? new Fuse(gltfs, fuseOptions) : undefined);
  }, [gltfs]);

  useEffect(() => {
    setList(
      searchTerm.length === 0
        ? gltfs
        : fuse
        ? (fuse.search(searchTerm) as Fuse.FuseResultWithScore<
            GltfSource
          >[]).map(result => result.item)
        : [],
    );
  }, [fuse, searchTerm, gltfs]);

  return (
    <>
      <SearchField term={searchTerm} onChange={setSearchTerm} />
      <Divider />
      <List id="gltf-list" className={classes.list}>
        {list.map(gltf => (
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
    </>
  );
});
