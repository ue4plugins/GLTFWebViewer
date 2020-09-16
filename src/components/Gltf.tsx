import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@material-ui/core";
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
    "& p:not(:last-of-type)": {
      marginBottom: theme.spacing(2),
    },
  },
}));

export const Gltf: React.FC = observer(() => {
  const classes = useStyles();
  const { gltfStore } = useStores();
  const { variantSetManager, gltf, showVariantSet } = gltfStore;
  const [variantSets, setVariantSets] = useState<VariantSet[]>([]);

  useEffect(() => {
    if (variantSetManager) {
      setVariantSets(variantSetManager.variantSets);
    }

    return () => {
      setVariantSets([]);
    };
  }, [variantSetManager]);

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
      {(gltf.description || gltf.creator) && (
        <>
          <Divider />
          <div className={classes.meta}>
            {gltf.description && (
              <>
                <Typography variant="overline" color="textSecondary">
                  Description
                </Typography>
                <Typography>{gltf.description}</Typography>
              </>
            )}
            {gltf.creator && (
              <>
                <Typography variant="overline" color="textSecondary">
                  Creator
                </Typography>
                <Typography>
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
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
});
