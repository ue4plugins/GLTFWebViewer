import React from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  list: {
    position: "relative",
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
}));

export type NavListProps = {};

export const NavList: React.FC<NavListProps> = ({ children }) => {
  const classes = useStyles();
  return <ul className={classes.list}>{children}</ul>;
};
