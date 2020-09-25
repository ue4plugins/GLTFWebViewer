import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import { Hamburger } from "./Hamburger";

const useStyles = makeStyles(theme => ({
  button: {
    marginLeft: theme.spacing(1),
    padding: theme.spacing(1),
  },
}));

export type SidebarToggleProps = {
  open: boolean;
  toggleOpen: (open: boolean) => void;
};

export const SidebarToggle: React.FC<SidebarToggleProps> = ({
  open,
  toggleOpen,
}) => {
  const classes = useStyles();

  return (
    <IconButton
      className={classes.button}
      aria-label="open sidebar"
      data-testid="open-button"
      disableTouchRipple
      onClick={() => toggleOpen(!open)}
    >
      <Hamburger active={open} />
    </IconButton>
  );
};
