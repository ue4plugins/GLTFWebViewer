import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Divider } from "@material-ui/core";
import { VariantSet } from "../variants";
import { GltfSource } from "../types";
import { NavList } from "./NavList";
import { NavListItem } from "./NavListItem";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  },
  variantSets: {
    flex: "1 1 auto",
    padding: theme.spacing(2, 3),
    overflow: "auto",
  },
  meta: {
    flex: "0 0 auto",
    padding: theme.spacing(3),
    "& a": {
      color: theme.palette.common.white,
    },
    "& p:not(:last-of-type)": {
      marginBottom: theme.spacing(2),
    },
  },
}));

export type GltfContentProps = {
  gltf: GltfSource;
  variantSets: VariantSet[];
  onVariantSetSelect: (id: number) => void;
};

export const GltfContent: React.FC<GltfContentProps> = ({
  gltf,
  variantSets,
  onVariantSetSelect,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.variantSets}>
        {variantSets.length > 0 ? (
          <NavList>
            {variantSets.map((variantSet, variantSetId) => (
              <NavListItem
                onClick={() => onVariantSetSelect(variantSetId)}
                key={variantSetId}
              >
                {variantSet.name}
              </NavListItem>
            ))}
          </NavList>
        ) : (
          <Typography>This file has no configurable options</Typography>
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
                <Typography variant="body2">{gltf.description}</Typography>
              </>
            )}
            {gltf.creator && (
              <>
                <Typography variant="overline" color="textSecondary">
                  Creator
                </Typography>
                <Typography variant="body2">
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
