import React from "react";
import { render } from "react-dom";
import { ThemeProvider } from "@material-ui/core/styles";
import { createDecoderModule } from "draco3d";
import { Root } from "./containers/Root";
import { RootStoreProvider } from "./stores";
import { theme } from "./theme";
import * as serviceWorker from "./serviceWorker";

// Used by PlayCanvas glTF parser
window.DracoDecoderModule = createDecoderModule();

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
