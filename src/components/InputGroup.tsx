import React from "react";
import { makeStyles } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(2, 2, 1, 2),
  },
  fullWidth: {
    marginLeft: 0,
    marginRight: 0,
  },
}));

export type InputGroupProps = {
  fullWidth?: boolean;
};

export const InputGroup: React.FC<InputGroupProps> = ({
  children,
  fullWidth,
}) => {
  const classes = useStyles();
  return (
    <div
      className={clsx(classes.root, {
        [classes.fullWidth]: fullWidth,
      })}
    >
      {children}
    </div>
  );
};
