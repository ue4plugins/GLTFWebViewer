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
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "flex-start",
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
