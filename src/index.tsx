/* istanbul ignore file */
import React from "react";
import { render } from "react-dom";
import { ThemeProvider } from "@material-ui/core/styles";
import { createDecoderModule } from "draco3d";
import { Root } from "./containers";
import { RootStoreProvider } from "./stores";
import { theme } from "./theme";

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
