import React, { useState, useEffect } from "react";
import clsx from "clsx";
import CssBaseline from "@material-ui/core/CssBaseline";
import { Hidden, makeStyles, Typography } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { Sidebar, FpsMonitor, SidebarToggle } from "../components";
import { useStores } from "../stores";
import { useAsyncWithLoadingAndErrorHandling } from "../hooks";
import { Viewer } from "./Viewer";
import { Gltf } from "./Gltf";
import { Cameras } from "./Cameras";

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
    height: "100%",
  },
  topbar: {
    position: "relative",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    height: theme.topbarHeight,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.paper,
    zIndex: 1,
  },
  topbarLogo: {
    flex: "0 0 40px",
    height: 24,
    objectFit: "contain",
    objectPosition: "left 50%",
  },
  topbarTitle: {
    flex: "1 1 auto",
    textAlign: "center",
  },
  topbarToggle: {
    display: "flex",
    flex: "0 0 40px",
    justifyContent: "flex-end",
  },
  main: {
    display: "flex",
    height: `calc(100% - ${theme.topbarHeight}px)`,
  },
  mainFullheight: {
    height: "100%",
  },
  viewport: {
    position: "relative",
    flexGrow: 1,
    height: "100%",
    backgroundColor: theme.palette.common.black,
    overflow: "hidden",
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
  const { gltfStore, settingsStore } = useStores();
  const { gltf, gltfs, fetchGltfs } = gltfStore;
  const { showUI, showFpsMeter } = settingsStore;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, isError, runAsync] = useAsyncWithLoadingAndErrorHandling();
  const isEmpty = gltfs.length === 0 && !gltf;

  useEffect(() => {
    runAsync(async () => {
      await fetchGltfs();
    });
  }, [fetchGltfs, runAsync]);

  useEffect(() => setIsSidebarOpen(!isEmpty), [isEmpty]);

  return (
    <>
      <CssBaseline />
      <div className={classes.root}>
        {showUI && (
          <header className={classes.topbar}>
            <img
              className={classes.topbarLogo}
              src={"viewer/logo.svg"}
              alt="Logo"
            />
            <Typography className={classes.topbarTitle} variant="body2">
              Epic Games glTF Viewer
              {gltf && ` — ${gltf.name}`}
            </Typography>
            <div className={classes.topbarToggle}>
              <SidebarToggle
                open={isSidebarOpen}
                toggleOpen={setIsSidebarOpen}
              />
            </div>
          </header>
        )}
        <main
          className={clsx(classes.main, {
            [classes.mainFullheight]: !showUI,
          })}
        >
          <div
            className={clsx(classes.viewport, {
              [classes.viewportFullscreen]: !isSidebarOpen,
            })}
          >
            <Viewer isError={isError} isEmpty={isEmpty} />
            {showUI && <Cameras />}
            {showUI && showFpsMeter && (
              <Hidden xsDown>
                <FpsMonitor />
              </Hidden>
            )}
          </div>
          {showUI && (
            <Sidebar open={isSidebarOpen}>
              <Gltf isLoading={isLoading} isError={isError} />
            </Sidebar>
          )}
        </main>
      </div>
    </>
  );
});
