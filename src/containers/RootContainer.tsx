import React, { useState } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider, makeStyles } from "@material-ui/core/styles";
import { theme } from "../theme";
import { Sidebar } from "../components/Sidebar";
import { FpsMonitor } from "../components/FpsMonitor";
import { PlayCanvas } from "./PlayCanvas";

const drawerWidth = 300;
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
    width: `calc(100% - ${drawerWidth}px)`,
    height: "100%",
    backgroundColor: theme.palette.background.default,
  },
}));

const DAMAGED_HELMET = GLTF_MODELS.find(
  val => val.name === "DamagedHelmet",
) as GLTF_MODEL;

export const RootContainer: React.FC = () => {
  const classes = useStyles();
  const [model, setModel] = useState<GLTF_MODEL>(DAMAGED_HELMET);

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <main className={classes.viewport}>
          <PlayCanvas model={model}></PlayCanvas>
        </main>
        <Sidebar setModel={setModel}></Sidebar>
        <FpsMonitor bottom="8px" left="8px" />
      </div>
    </ThemeProvider>
  );
};
