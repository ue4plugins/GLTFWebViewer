import React, { useState, useEffect } from "react";
import clsx from "clsx";
import CssBaseline from "@material-ui/core/CssBaseline";
import { Hidden, Tabs, Tab, makeStyles, Divider } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { Sidebar, FpsMonitor, SidebarToggle } from "../components";
import { useStores } from "../stores";
import { useAsyncWithLoadingAndErrorHandling } from "../hooks";
import { Viewer } from "./Viewer";
import { SettingsView } from "./SettingsView";
import { GltfView } from "./GltfView";
import logo from "./logo.svg";

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
    paddingRight: theme.spacing(2),
    color: theme.palette.common.white,
    backgroundColor: theme.palette.background.default,
    zIndex: 1,
  },
  topbarLogo: {
    flex: "0 0 auto",
    height: 24,
  },
  topbarToolbar: {
    display: "flex",
    flex: "1 1 auto",
    justifyContent: "flex-end",
  },
  main: {
    display: "flex",
    height: `calc(100% - ${theme.topbarHeight}px)`,
  },
  viewport: {
    position: "relative",
    flexGrow: 1,
    height: "100%",
    backgroundColor: theme.palette.common.black,
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

type ActiveTab = "gltf" | "settings";

export const Root: React.FC = observer(() => {
  const classes = useStyles();
  const { gltfStore, settingsStore } = useStores();
  const { fetchGltfs } = gltfStore;
  const { showUI, showFpsMeter } = settingsStore;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("gltf");
  const [isLoading, isError, runAsync] = useAsyncWithLoadingAndErrorHandling();

  useEffect(() => {
    runAsync(async () => {
      await fetchGltfs();
    });
  }, [fetchGltfs, runAsync]);

  return (
    <>
      <CssBaseline />
      <div className={classes.root}>
        <header className={classes.topbar}>
          <img className={classes.topbarLogo} src={logo} alt="Logo" />
          <div className={classes.topbarToolbar}>Toolbar</div>
        </header>
        <main className={classes.main}>
          <div
            className={clsx(classes.viewport, {
              [classes.viewportFullscreen]: !isSidebarOpen,
            })}
          >
            <Viewer />
            {showUI && (
              <SidebarToggle
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
              />
            )}
          </div>
          {showUI && (
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen}>
              <Tabs
                value={activeTab}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                onChange={(_, value) => setActiveTab(value)}
              >
                <Tab id="gltf-tab" label="glTF" value="gltf" />
                <Tab id="settings-tab" label="Settings" value="settings" />
              </Tabs>
              <Divider />
              {activeTab === "settings" && <SettingsView />}
              {activeTab === "gltf" && (
                <GltfView isLoading={isLoading} isError={isError} />
              )}
            </Sidebar>
          )}
          {showUI && showFpsMeter && (
            <Hidden xsDown>
              <FpsMonitor />
            </Hidden>
          )}
        </main>
      </div>
    </>
  );
});
