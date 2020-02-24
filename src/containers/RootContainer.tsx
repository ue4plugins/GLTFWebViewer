import React, { useState } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider, makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import { theme } from "../theme";
import { ModelList } from "../components/ModelList";
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
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  toolbar: theme.mixins.toolbar,
  content: {
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
        <main className={classes.content}>
          <PlayCanvas model={model}></PlayCanvas>
        </main>
        <Drawer
          className={classes.drawer}
          variant="persistent"
          anchor="right"
          open={true}
          onWheel={e => e.nativeEvent.stopPropagation()}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <ModelList onSelect={setModel} />
        </Drawer>
      </div>
    </ThemeProvider>
  );
};
