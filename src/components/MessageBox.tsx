import React from "react";
import { makeStyles, Typography } from "@material-ui/core";
import { ReactComponent as DragDropIcon } from "../icons/DragDrop.svg";
import { ReactComponent as ErrorIcon } from "../icons/Error.svg";
import { ReactComponent as EmptyConfigurationIcon } from "../icons/EmptyConfiguration.svg";

const useStyles = makeStyles(theme => {
  const iconCircleSize = 88;
  return {
    root: {
      padding: theme.spacing(5),
      textAlign: "center",
    },
    icon: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: "auto",
      marginRight: "auto",
      marginBottom: theme.spacing(4),
      width: iconCircleSize,
      height: iconCircleSize,
      borderRadius: "50%",
      backgroundColor: theme.palette.grey[700],
    },
  };
});

export type MessageBoxProps = {
  icon?: "empty" | "error" | "dragdrop";
  overline?: string;
  title: string;
};

export const MessageBox: React.FC<MessageBoxProps> = ({
  icon: type,
  children,
  overline,
  title,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {type && (
        <div className={classes.icon}>
          {(() => {
            switch (type) {
              case "empty":
                return <EmptyConfigurationIcon />;
              case "error":
                return <ErrorIcon />;
              case "dragdrop":
                return <DragDropIcon />;
            }
          })()}
        </div>
      )}
      {overline && (
        <Typography variant="overline" color="textSecondary">
          {overline}
        </Typography>
      )}
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {children}
      </Typography>
    </div>
  );
};
