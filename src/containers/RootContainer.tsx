import React from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider, makeStyles } from "@material-ui/core/styles";
import { theme } from "../theme";
import { Sidebar } from "../components/Sidebar";
import { FpsMonitor } from "../components/FpsMonitor";
import { RootStoreProvider } from "../stores";
import { Viewer } from "./Viewer";

const urlParams = new URLSearchParams(window.location.search);
const showUI = !urlParams.get("hideUI");

const drawerWidth = showUI ? 300 : 0;
const useStyles = makeStyles(() => ({
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
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginRight: drawerWidth,
  },
  viewport: {
    position: "relative",
    width: `calc(100% - ${drawerWidth}px)`,
    height: "100%",
    backgroundColor: theme.palette.background.default,
  },
}));

export const RootContainer: React.FC = () => {
  const classes = useStyles();
  return (
    <RootStoreProvider>
      <ThemeProvider theme={theme}>
        <div className={classes.root}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <main className={classes.viewport}>
            <Viewer />
          </main>
          {showUI && <Sidebar />}
          {showUI && <FpsMonitor bottom="8px" left="8px" />}
        </div>
      </ThemeProvider>
    </RootStoreProvider>
  );
};
