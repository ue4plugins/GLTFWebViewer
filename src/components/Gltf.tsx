import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, List, ListItem, ListItemText } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { useStores } from "../stores";
import { VariantSet } from "../variants";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  },
  list: {
    flex: "1 1 auto",
    overflow: "auto",
  },
  meta: {
    flex: "0 0 auto",
    margin: theme.spacing(2, 2, 3, 2),
  },
}));

export const Gltf: React.FC = observer(() => {
  const classes = useStyles();
  const { gltfStore } = useStores();
  const { variantSetManager: manager, gltf, showVariantSet } = gltfStore;
  const [variantSets, setVariantSets] = useState<VariantSet[]>([]);

  useEffect(() => {
    if (manager) {
      setVariantSets(manager.variantSets);
    }

    return () => {
      setVariantSets([]);
    };
  }, [manager]);

  if (!gltf) {
    return null;
  }

  return (
    <div className={classes.root}>
      <div className={classes.list}>
        {variantSets.length > 0 && (
          <List>
            {variantSets.map((variantSet, variantSetId) => (
              <ListItem
                onClick={() => showVariantSet(variantSetId)}
                button
                key={variantSetId}
              >
                <ListItemText primary={variantSet.name} />
              </ListItem>
            ))}
          </List>
        )}
      </div>
      <div className={classes.meta}>
        {gltf.description && (
          <Typography variant="caption" component="div">
            Description: {gltf.description}
          </Typography>
        )}
        {gltf.creator && (
          <Typography variant="caption" component="div">
            Creator:{" "}
            {gltf.creatorUrl ? (
              <a
                href={gltf.creatorUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {gltf.creator}
              </a>
            ) : (
              gltf.creator
            )}
          </Typography>
        )}
      </div>
    </div>
  );
});
