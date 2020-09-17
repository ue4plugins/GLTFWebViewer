import React from "react";
import { makeStyles } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles(theme => {
  const borderBoxShadow = `1px 0 0 0 ${theme.palette.grey[500]} inset`;
  return {
    list: {
      position: "relative",
      margin: 0,
      padding: 0,
      listStyle: "none",
    },
    item: {
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
      padding: theme.spacing(1, 0, 1, 2),
      boxShadow: borderBoxShadow,
      "&:hover": {
        boxShadow:
          `2px 0 0 0 ${theme.palette.primary.main} inset, ` + borderBoxShadow,
      },
    },
    selected: {
      "&::before": {
        display: "inline-block",
        height: 6,
        width: 6,
        marginRight: theme.spacing(1),
        borderRadius: "50%",
        backgroundColor: theme.palette.primary.main,
        content: "''",
      },
    },
  };
});

export type NavListItemProps = {
  selected?: boolean;
  onClick?: () => void;
};

export const NavListItem: React.FC<NavListItemProps> = ({
  children,
  selected,
  onClick,
}) => {
  const classes = useStyles();

  return (
    <li
      onClick={onClick}
      className={clsx(classes.item, {
        [classes.selected]: selected,
      })}
    >
      {children}
    </li>
  );
};

export type NavListProps = {};

export const NavList: React.FC<NavListProps> = ({ children }) => {
  const classes = useStyles();

  return <ul className={classes.list}>{children}</ul>;
};
