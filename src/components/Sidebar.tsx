import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Drawer, Divider, IconButton } from "@material-ui/core";
import { ChevronRight } from "@material-ui/icons";
import { ModelList } from "./ModelList";
import { SceneSelector } from "./SceneSelector";

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

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export const Sidebar: React.FC<Props> = ({ isOpen, setIsOpen }) => {
  const classes = useStyles();

  return (
    <Drawer
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
      <div className={classes.drawerHeader}>
        <IconButton onClick={() => setIsOpen(false)}>
          <ChevronRight />
        </IconButton>
      </div>
      <Divider />
      <SceneSelector />
      <Divider />
      <ModelList />
    </Drawer>
  );
};
