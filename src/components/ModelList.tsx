import React, { useEffect, useState } from "react";
import Fuse from "fuse.js";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import { makeStyles } from "@material-ui/core/styles";
import { useStores } from "../stores";
import { SearchField } from "./SearchField";

const useStyles = makeStyles(() => ({
  scrollableList: {
    maxHeight: "100%",
    overflow: "auto",
  },
}));

const fuseOptions = {
  shouldSort: true,
  includeScore: false,
  threshold: 0.6,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 0,
  keys: ["name"],
};

export const ModelList: React.FC<{}> = () => {
  const classes = useStyles();
  const { modelStore } = useStores();
  const { models, setModel } = modelStore;
  const [searchTerm, setSearchTerm] = useState("");
  const [fuse] = useState(new Fuse(GLTF_MODELS, fuseOptions));
  const [list, setList] = useState(GLTF_MODELS);

  useEffect(() => {
    setList(
      searchTerm.length === 0
        ? models
        : (fuse.search(searchTerm) as GLTF_MODEL[]),
    );
  }, [fuse, searchTerm, models]);

  return (
    <>
      <SearchField term={searchTerm} onChange={setSearchTerm} />
      <Divider />
      <List className={classes.scrollableList}>
        {list.map(model => (
          <ListItem
            onClick={() => setModel(model)}
            button
            key={model.path + model.name}
          >
            <ListItemText primary={model.name} secondary={model.type} />
          </ListItem>
        ))}
      </List>
    </>
  );
};
