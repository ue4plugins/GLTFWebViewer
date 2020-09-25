import React from "react";
import { makeStyles, Typography } from "@material-ui/core";
import { ReactComponent as ErrorIcon } from "../icons/Error.svg";
import { ReactComponent as EmptyConfigurationIcon } from "../icons/EmptyConfiguration.svg";

const useStyles = makeStyles(theme => {
  const iconCircleSize = 88;
  const iconSize = 56;
  return {
    root: {
      padding: theme.spacing(5),
      textAlign: "center",
    },
    icon: {
      display: "block",
      marginLeft: "auto",
      marginRight: "auto",
      marginBottom: theme.spacing(4),
      width: iconCircleSize,
      height: iconCircleSize,
      paddingTop: (iconCircleSize - iconSize) / 2,
      borderRadius: "50%",
      backgroundColor: theme.palette.grey[700],
      "& svg": {
        height: iconSize,
      },
    },
  };
});

export type ErrorMessageProps = {
  type: "empty" | "unexpected";
  overline: string;
  title: string;
};

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  type,
  children,
  overline,
  title,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.icon}>
        {(() => {
          switch (type) {
            case "empty":
              return <EmptyConfigurationIcon />;
            case "unexpected":
              return <ErrorIcon />;
          }
        })()}
      </div>
      <Typography variant="overline" color="textSecondary">
        {overline}
      </Typography>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {children}
      </Typography>
    </div>
  );
};
