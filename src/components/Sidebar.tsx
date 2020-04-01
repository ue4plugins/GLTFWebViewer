import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { ModelList } from "./ModelList";
import { SceneSelector } from "./SceneSelector";
import { Drawer, Divider, IconButton, Theme } from "@material-ui/core";
import { ChevronRight } from "@material-ui/icons";

const useStyles = makeStyles<Theme, Props>(theme => ({
  drawer: props => ({
    width: props.width,
    flexShrink: 0,
  }),
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
  width: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export const Sidebar: React.FC<Props> = props => {
  const { isOpen, setIsOpen } = props;
  const classes = useStyles(props);
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
