import React from "react";
import Drawer from "@material-ui/core/Drawer";
import { makeStyles } from "@material-ui/core/styles";
import { ModelList } from "./ModelList";
import { SceneSelector } from "./SceneSelector";

const drawerWidth = 300;
const useStyles = makeStyles(theme => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    width: `calc(100% - ${drawerWidth}px)`,
    height: "100%",
    backgroundColor: theme.palette.background.default,
  },
}));

export const Sidebar: React.FC = () => {
  const classes = useStyles();
  return (
    <Drawer
      className={classes.drawer}
      variant="persistent"
      anchor="right"
      open={true}
      onWheel={e => e.nativeEvent.stopPropagation()}
      classes={{
        paper: classes.drawerPaper,
      }}
      onMouseDown={e => {
        e.stopPropagation();
      }}
    >
      <SceneSelector />
      <ModelList />
    </Drawer>
  );
};
