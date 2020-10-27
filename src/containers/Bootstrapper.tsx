import React, { useEffect } from "react";
import { ThemeProvider } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { createTheme } from "../theme";
import { useStores } from "../stores";
import { useAsyncWithLoadingAndErrorHandling } from "../hooks";
import { fetchConfig } from "../fetchConfig";
import { Root } from "./Root";

const defaultTheme = createTheme();

export const Bootstrapper: React.FC = observer(() => {
  const { gltfStore, settingsStore } = useStores();
  const { setGltfs } = gltfStore;
  const { initFromConfig } = settingsStore;
  const [isLoading, isError, runAsync] = useAsyncWithLoadingAndErrorHandling();

  useEffect(() => {
    runAsync(async () => {
      const config = await fetchConfig();
      initFromConfig(config);
      setGltfs(config.assets);
    });
  }, [setGltfs, runAsync, initFromConfig]);

  return (
    <ThemeProvider theme={defaultTheme}>
      <Root isLoading={isLoading} isError={isError} />
    </ThemeProvider>
  );
});
