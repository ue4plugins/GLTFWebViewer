import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import { GltfSource } from "../types";

const useStyles = makeStyles(theme => ({
  root: {
    position: "absolute",
    right: theme.spacing(2),
    bottom: theme.spacing(2),
    textAlign: "right",
    color: theme.palette.common.white,
    textShadow: `0px 0px 2px ${theme.palette.common.black}`,
  },
  link: {
    color: theme.palette.common.white,
  },
}));

export type GltfMetaProps = {
  gltf: GltfSource;
};

export const GltfMeta: React.FC<GltfMetaProps> = ({ gltf }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Typography variant="h6">{gltf.name}</Typography>
      {gltf.creator && (
        <Typography variant="caption">
          By{" "}
          {gltf.creatorUrl ? (
            <a
              className={classes.link}
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
  );
};
