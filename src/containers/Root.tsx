import React, { useState, useEffect } from "react";
import clsx from "clsx";
import {
  Hidden,
  makeStyles,
  Typography,
  useTheme,
  useMediaQuery,
} from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { Sidebar, FpsMonitor, SidebarToggle } from "../components";
import { useStores } from "../stores";
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
    maxWidth: 40,
    height: 24,
    overflow: "visible",
  },
  topbarLogoImage: {
    height: "100%",
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
  },
  viewportWithVisibleSidebar: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  viewportWithHiddenSidebar: {
    marginRight: -1 * theme.sidebarWidth,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
}));

export type RootProps = {
  isLoading: boolean;
  isError: boolean;
};

export const Root: React.FC<RootProps> = observer(({ isLoading, isError }) => {
  const classes = useStyles();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("xs"));
  const { gltfStore, settingsStore } = useStores();
  const { gltf, gltfs } = gltfStore;
  const {
    showTopbar,
    showSidebar,
    showCameras,
    topbarTitle,
    topbarLogoUrl,
    showFpsMeter,
  } = settingsStore;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isEmpty = gltfs.length === 0 && !gltf;

  useEffect(() => setIsSidebarOpen(!isEmpty && !isSmallScreen), [
    isEmpty,
    isSmallScreen,
  ]);

  return (
    <div className={classes.root}>
      {showTopbar && (
        <header className={classes.topbar}>
          <div className={classes.topbarLogo}>
            {topbarLogoUrl && (
              <img
                className={classes.topbarLogoImage}
                src={topbarLogoUrl}
                alt="Logo"
              />
            )}
          </div>
          <Typography className={classes.topbarTitle} variant="body2">
            {topbarTitle !== undefined && (
              <>
                {topbarTitle}
                {gltf && topbarTitle && " - "}
                {gltf && gltf.name}
              </>
            )}
          </Typography>
          <div className={classes.topbarToggle}>
            {showSidebar && (
              <SidebarToggle
                open={isSidebarOpen}
                toggleOpen={setIsSidebarOpen}
              />
            )}
          </div>
        </header>
      )}
      <main
        className={clsx(classes.main, {
          [classes.mainFullheight]: !showTopbar,
        })}
      >
        <div
          className={clsx(classes.viewport, {
            [classes.viewportWithHiddenSidebar]: showSidebar && !isSidebarOpen,
            [classes.viewportWithVisibleSidebar]: showSidebar && isSidebarOpen,
          })}
        >
          <Viewer isLoading={isLoading} isError={isError} isEmpty={isEmpty} />
          {showCameras && <Cameras />}
          {showFpsMeter && (
            <Hidden xsDown>
              <FpsMonitor />
            </Hidden>
          )}
        </div>
        {showSidebar && (
          <Sidebar open={isSidebarOpen}>
            <Gltf isError={isError} />
          </Sidebar>
        )}
      </main>
    </div>
  );
});
