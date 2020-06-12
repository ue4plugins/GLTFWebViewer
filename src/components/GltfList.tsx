import React, { useEffect, useState } from "react";
import Fuse, { FuseOptions } from "fuse.js";
import {
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { observer } from "mobx-react-lite";
import { useStores } from "../stores";
import { useAsyncWithLoadingAndErrorHandling } from "../hooks";
import { GltfSource } from "../types";
import { SearchField } from "./SearchField";

const useStyles = makeStyles(theme => ({
  list: {
    maxHeight: "100%",
    overflow: "auto",
    textTransform: "capitalize",
  },
  spinner: {
    paddingTop: theme.spacing(2),
    textAlign: "center",
  },
  error: {
    margin: theme.spacing(2),
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

export const GltfList: React.FC = observer(() => {
  const classes = useStyles();
  const { gltfStore } = useStores();
  const { gltf: selectedGltf, gltfs, setGltf, fetchGltfs } = gltfStore;
  const [isLoading, isError, runAsync] = useAsyncWithLoadingAndErrorHandling();
  const [searchTerm, setSearchTerm] = useState("");
  const [fuse, setFuse] = useState<Fuse<GltfSource, typeof fuseOptions>>();
  const [list, setList] = useState(gltfs);

  useEffect(() => {
    runAsync(async () => {
      await fetchGltfs();
    });
  }, [fetchGltfs, runAsync]);

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
        {isLoading ? (
          <div className={classes.spinner}>
            <CircularProgress />
          </div>
        ) : isError ? (
          <Typography
            className={classes.error}
            variant="body2"
            color="textSecondary"
          >
            Something went wrong when loading glTF files. Check console for more
            details.
          </Typography>
        ) : (
          list.map(gltf => (
            <ListItem
              onClick={() => setGltf(gltf)}
              button
              key={gltf.filePath}
              selected={selectedGltf && gltf.filePath === selectedGltf.filePath}
            >
              <ListItemText primary={gltf.name} secondary={gltf.description} />
            </ListItem>
          ))
        )}
      </List>
    </>
  );
});
