import React, { useState, useEffect } from "react";
import clsx from "clsx";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles } from "@material-ui/core/styles";
import { Divider } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import {
  Sidebar,
  FpsMonitor,
  SidebarToggle,
  SceneSelector,
  ModelList,
  ModelMeta,
  AnimationSelector,
} from "../components";
import { useStores } from "../stores";
import { Viewer } from "./Viewer";

const urlParams = new URLSearchParams(window.location.search);
const showUI = !urlParams.get("hideUI");

const useStyles = makeStyles(theme => ({
  "@global": {
    html: {
      height: "100%",
    },
    body: {
      height: "100%",
      margin: "0",
      overflow: "hidden",
    },
    "#root": {
      height: "100%",
    },
  },
  root: {
    display: "flex",
    height: "100%",
  },
  viewport: {
    position: "relative",
    flexGrow: 1,
    height: "100%",
    backgroundColor: theme.palette.background.default,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  viewportFullscreen: {
    marginRight: -1 * theme.sidebarWidth,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
}));

export const Root: React.FC = observer(() => {
  const classes = useStyles();
  const { modelStore } = useStores();
  const { model, fetchModels, animations } = modelStore;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!showUI) {
      fetchModels();
    }
  }, [fetchModels]);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <main
        className={clsx(classes.viewport, {
          [classes.viewportFullscreen]: !isSidebarOpen,
        })}
      >
        <Viewer />
        {showUI && (
          <SidebarToggle isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        )}
        {showUI && model && <ModelMeta model={model} />}
      </main>
      {showUI && (
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen}>
          <SceneSelector />
          <Divider />
          {animations.length > 0 && (
            <>
              <AnimationSelector />
              <Divider />
            </>
          )}
          <ModelList />
        </Sidebar>
      )}
      {showUI && <FpsMonitor />}
    </div>
  );
});
