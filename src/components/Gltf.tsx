import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@material-ui/core";
import { VariantSet } from "../variants";
import { GltfSource } from "../types";

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

export type GltfProps = {
  gltf: GltfSource;
  variantSets: VariantSet[];
  onVariantSetSelect: (id: number) => void;
};

export const Gltf: React.FC<GltfProps> = ({
  gltf,
  variantSets,
  onVariantSetSelect,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.list}>
        {variantSets.length > 0 && (
          <List>
            {variantSets.map((variantSet, variantSetId) => (
              <ListItem
                onClick={() => onVariantSetSelect(variantSetId)}
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
};
