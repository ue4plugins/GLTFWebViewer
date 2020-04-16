import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import Debug from "debug";
import {
  Backdrop,
  CircularProgress,
  makeStyles,
  Card,
  CardContent,
  Typography,
} from "@material-ui/core";
import { PlayCanvasViewer } from "../playcanvas";
import { useStores } from "../stores";
import {
  useAsyncWithLoadingAndErrorHandling,
  usePreventableCameraInteractions,
} from "../hooks";

const urlParams = new URLSearchParams(window.location.search);
const autoPlayAnimations = !urlParams.get("noAnimations");

const debug = Debug("viewer");

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

export const Viewer: React.FC = observer(() => {
  const classes = useStyles();
  const { modelStore, sceneStore } = useStores();
  const { model } = modelStore;
  const { scene, setScenes } = sceneStore;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewer, setViewer] = useState<PlayCanvasViewer>();
  const [isLoading, isError, runAsync] = useAsyncWithLoadingAndErrorHandling();
  const showBackdrop = isLoading || isError;
  const [setPreventInteraction] = usePreventableCameraInteractions(
    showBackdrop,
  );

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    debug("Create viewer");
    const viewer = new PlayCanvasViewer(canvasRef.current, {
      autoPlayAnimations,
    });

    runAsync(async () => {
      debug("Configure viewer start");
      await viewer.configure();
      setViewer(viewer);
      window.viewer = viewer;
      debug("Configure viewer end");
    });

    return () => {
      debug("Destroy viewer");
      window.viewer = undefined;
      viewer.destroy();
    };
  }, [runAsync]);

  useEffect(() => {
    if (!viewer?.initiated) {
      return;
    }
    debug("Set scene list", viewer.scenes);
    setScenes(viewer.scenes);

    return () => {
      debug("Unset scene list");
      setScenes([]);
    };
  }, [viewer, setScenes]);

  useEffect(() => {
    if (!viewer?.initiated || !scene) {
      return;
    }

    runAsync(async () => {
      debug("Load scene start", scene.url);
      await viewer.loadScene(scene.url);
      debug("Load scene end", scene.url);
    });

    return () => {
      debug("Destroy scene");
      viewer.destroyScene();
    };
  }, [runAsync, viewer, scene]);

  useEffect(() => {
    if (!viewer?.initiated || !model) {
      return;
    }

    runAsync(async () => {
      debug("Load model start", model.path);
      await viewer.loadModel(model.path);
      debug("Load model end", model.path);
    });

    return () => {
      debug("Destroy model");
      viewer.destroyModel();
    };
  }, [runAsync, viewer, model]);

  useEffect(() => {
    debug("Prevent camera interaction", showBackdrop);
    setPreventInteraction(showBackdrop);
  }, [showBackdrop, setPreventInteraction]);

  return (
    <>
      <canvas className={classes.canvas} ref={canvasRef} />
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
