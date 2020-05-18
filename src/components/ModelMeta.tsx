import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import { GltfFile } from "../playcanvas";

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

type Props = {
  model: GltfFile;
};

export const ModelMeta: React.FC<Props> = ({ model }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Typography variant="h6">{model.name}</Typography>
      {model.creator && (
        <Typography variant="caption">
          By{" "}
          {model.creatorUrl ? (
            <a
              className={classes.link}
              href={model.creatorUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {model.creator}
            </a>
          ) : (
            model.creator
          )}
        </Typography>
      )}
    </div>
  );
};
