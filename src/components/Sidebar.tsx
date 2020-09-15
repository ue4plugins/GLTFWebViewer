import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Drawer } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  drawer: {
    width: theme.sidebarWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    position: "relative",
    width: "100%",
    border: "none",
  },
}));

export type SidebarProps = {
  isOpen: boolean;
};

export const Sidebar: React.FC<SidebarProps> = ({ children, isOpen }) => {
  const classes = useStyles();

  return (
    <Drawer
      id="sidebar"
      className={classes.drawer}
      variant="persistent"
      anchor="right"
      open={isOpen}
      onWheel={e => e.nativeEvent.stopPropagation()}
      onMouseDown={e => {
        e.stopPropagation();
      }}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      {children}
    </Drawer>
  );
};
