import React, { useEffect, useState } from "react";
import { ThemeProvider, CssBaseline } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { createTheme } from "../theme";
import { useStores } from "../stores";
import { useAsyncWithLoadingAndErrorHandling } from "../hooks";
import { fetchConfig } from "../fetchConfig";
import { waitFor } from "../utilities";
import { Root } from "./Root";

const defaultTheme = createTheme();

export const Bootstrapper: React.FC = observer(() => {
  const { gltfStore, settingsStore } = useStores();
  const { setGltfs } = gltfStore;
  const { initFromConfig } = settingsStore;
  const [isLoading, isError, runAsync] = useAsyncWithLoadingAndErrorHandling();
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    const minLoadingTime = waitFor(1500);

    runAsync(async () => {
      const config = await fetchConfig();
      setTheme(createTheme(config.theme));
      await minLoadingTime;
      initFromConfig(config);
      setGltfs(config.assets);
    });
  }, [setGltfs, runAsync, initFromConfig]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Root isLoading={isLoading} isError={isError} />
    </ThemeProvider>
  );
});
