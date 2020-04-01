import React from "react";
import { render } from "react-dom";
import { ThemeProvider } from "@material-ui/core/styles";
import pc from "playcanvas";
import { Root } from "./containers/Root";
import { RootStoreProvider } from "./stores";
import { theme } from "./theme";
import * as serviceWorker from "./serviceWorker";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).pc = pc;

render(
  <RootStoreProvider>
    <ThemeProvider theme={theme}>
      <Root />
    </ThemeProvider>
  </RootStoreProvider>,
  document.getElementById("root"),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
