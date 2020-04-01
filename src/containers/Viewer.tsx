import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { PlayCanvasViewer } from "../lib/PlayCanvasViewer";
import { useStores } from "../stores";
import {
  useAsyncWithLoadingAndErrorHandling,
  usePreventableCameraInteractions,
} from "../hooks";
import {
  Backdrop,
  CircularProgress,
  makeStyles,
  Card,
  CardContent,
  Typography,
} from "@material-ui/core";

// TODO: remove
const delay = (duration: number) =>
  new Promise(resolve => {
    setTimeout(() => resolve(), duration);
  });

const useStyles = makeStyles(() => ({
  canvas: {
    position: "relative",
    maxWidth: "100%",
  },
  backdrop: {
    position: "absolute",
    zIndex: 3,
  },
  error: {
    maxWidth: 300,
  },
}));

export const Viewer: React.FC<{}> = observer(() => {
  const classes = useStyles();
  const { modelStore, sceneStore } = useStores();
  const { model } = modelStore;
  const { scene } = sceneStore;
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const [viewer, setViewer] = useState<PlayCanvasViewer>();
  const [isLoading, isError, runAsync] = useAsyncWithLoadingAndErrorHandling();
  const showBackdrop = isLoading || isError;
  const [setPreventInteraction] = usePreventableCameraInteractions(
    showBackdrop,
  );

  useEffect(() => {
    if (!canvasEl.current) {
      return;
    }

    const viewer = new PlayCanvasViewer(canvasEl.current);

    runAsync(async () => {
      await viewer.configure();
      await delay(1000);
      setViewer(viewer);
    });

    return () => {
      viewer.destroy();
    };
  }, [runAsync]);

  useEffect(() => {
    if (!viewer || !model) {
      return;
    }

    runAsync(async () => {
      await viewer.loadModel(`${model.path}/${model.name}.gltf`);
      await delay(1000);
    });

    return () => {
      viewer.destroyModel();
    };
  }, [runAsync, viewer, model]);

  useEffect(() => {
    if (!viewer || !scene) {
      return;
    }

    runAsync(async () => {
      await viewer.loadScene(scene.path);
      await delay(1000);
    });

    return () => {
      viewer.destroyScene();
    };
  }, [runAsync, viewer, scene]);

  useEffect(() => setPreventInteraction(showBackdrop), [
    showBackdrop,
    setPreventInteraction,
  ]);

  return (
    <>
      <canvas className={classes.canvas} ref={canvasEl} />
      <Backdrop className={classes.backdrop} open={showBackdrop}>
        {isLoading && <CircularProgress />}
        {isError && (
          <Card className={classes.error}>
            <CardContent>
              <Typography gutterBottom variant="h5">
                Error
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Something went wrong when loading the requested asset. Check
                console for more details.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Backdrop>
    </>
  );
});
