import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { ButtonBase } from "@material-ui/core";
import { Menu, Close } from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
  root: {
    textTransform: "uppercase",
    fontSize: theme.typography.pxToRem(9),
  },
  icon: {
    height: 24,
    marginLeft: theme.spacing(1),
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
    <ButtonBase
      className={classes.root}
      aria-label="open sidebar"
      data-testid="open-button"
      disableRipple
      onClick={() => setIsOpen(!isOpen)}
    >
      Configure
      <span className={classes.icon}>{isOpen ? <Close /> : <Menu />}</span>
    </ButtonBase>
  );
};
