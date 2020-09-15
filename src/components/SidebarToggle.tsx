import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import { Menu, Close } from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    alignItems: "center",
    textTransform: "uppercase",
    fontSize: theme.typography.pxToRem(9),
    fontFamily: "inherit",
  },
  button: {
    marginLeft: theme.spacing(1),
    padding: theme.spacing(1),
  },
}));

export type SidebarToggleProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export const SidebarToggle: React.FC<SidebarToggleProps> = ({
  isOpen,
  setIsOpen,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      Configure
      <IconButton
        className={classes.button}
        aria-label="open sidebar"
        data-testid="open-button"
        disableTouchRipple
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <Close /> : <Menu />}
      </IconButton>
    </div>
  );
};
