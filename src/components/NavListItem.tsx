import React from "react";
import { makeStyles } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles(theme => {
  const borderBoxShadow = `1px 0 0 0 ${theme.palette.grey[500]} inset`;
  return {
    item: {
      display: "flex",
      alignItems: "center",
      padding: theme.spacing(0, 0, 0, 2),
      height: 40,
      boxShadow: borderBoxShadow,
      cursor: "pointer",
      fontSize: 14,
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
