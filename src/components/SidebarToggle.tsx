import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Fab } from "@material-ui/core";
import { Menu } from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
  root: {
    position: "absolute",
    top: 0,
    right: 0,
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "flex-start",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1, 1),
    },
  },
  hide: {
    display: "none",
  },
}));

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export const SidebarToggle: React.FC<Props> = ({ isOpen, setIsOpen }) => {
  const classes = useStyles();

  return (
    <div
      className={clsx(classes.root, {
        [classes.hide]: isOpen,
      })}
    >
      <Fab
        color="default"
        aria-label="open sidebar"
        data-testid="open-button"
        size="medium"
        onClick={() => setIsOpen(true)}
      >
        <Menu />
      </Fab>
    </div>
  );
};
