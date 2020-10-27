/* istanbul ignore file */
import React from "react";
import { render } from "react-dom";
import { createDecoderModule } from "draco3d";
import { Bootstrapper } from "./containers";
import { RootStoreProvider } from "./stores";

// Used by PlayCanvas glTF parser
window.DracoDecoderModule = createDecoderModule();

render(
  <RootStoreProvider>
    <Bootstrapper />
  </RootStoreProvider>,
  document.getElementById("root"),
);
