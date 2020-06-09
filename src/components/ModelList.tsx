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
import { GltfSource } from "../playcanvas";
import { useAsyncWithLoadingAndErrorHandling } from "../hooks";
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

export const ModelList: React.FC = observer(() => {
  const classes = useStyles();
  const { gltfStore } = useStores();
  const { model: selectedModel, models, setModel, fetchModels } = gltfStore;
  const [isLoading, isError, runAsync] = useAsyncWithLoadingAndErrorHandling();
  const [searchTerm, setSearchTerm] = useState("");
  const [fuse, setFuse] = useState<Fuse<GltfSource, typeof fuseOptions>>();
  const [list, setList] = useState(models);

  useEffect(() => {
    runAsync(async () => {
      await fetchModels();
    });
  }, [fetchModels, runAsync]);

  useEffect(() => {
    setFuse(models.length > 0 ? new Fuse(models, fuseOptions) : undefined);
  }, [models]);

  useEffect(() => {
    setList(
      searchTerm.length === 0
        ? models
        : fuse
        ? (fuse.search(searchTerm) as Fuse.FuseResultWithScore<
            GltfSource
          >[]).map(result => result.item)
        : [],
    );
  }, [fuse, searchTerm, models]);

  return (
    <>
      <SearchField term={searchTerm} onChange={setSearchTerm} />
      <Divider />
      <List id="model-list" className={classes.list}>
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
            Something went wrong when loading models. Check console for more
            details.
          </Typography>
        ) : (
          list.map(model => (
            <ListItem
              onClick={() => setModel(model)}
              button
              key={model.filePath}
              selected={
                selectedModel && model.filePath === selectedModel.filePath
              }
            >
              <ListItemText
                primary={model.name}
                secondary={model.description}
              />
            </ListItem>
          ))
        )}
      </List>
    </>
  );
});
