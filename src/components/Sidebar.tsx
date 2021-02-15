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
  open: boolean;
};

export const Sidebar: React.FC<SidebarProps> = ({ children, open }) => {
  const classes = useStyles();

  return (
    <Drawer
      className={classes.drawer}
      variant="persistent"
      anchor="right"
      open={open}
      onWheel={e => e.nativeEvent.stopPropagation()}
      onMouseDown={e => {
        e.stopPropagation();
      }}
      classes={{
        paper: classes.drawerPaper,
      }}
      PaperProps={
        {
          "data-testid": "sidebar",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
      }
    >
      {children}
    </Drawer>
  );
};
